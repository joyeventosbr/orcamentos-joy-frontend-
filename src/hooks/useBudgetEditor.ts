import { budgetLinesReq } from "@/src/api/budget-lines/budget-lines.req";
import {
  buildBulkRequest,
  mapBudgetToUpdateRequest,
  mapDetailToBudget,
  mapLineToItem,
} from "@/src/api/budgets/budgets.mappers";
import { budgetsKeys } from "@/src/api/budgets/budgets.keys";
import { budgetsReq } from "@/src/api/budgets/budgets.req";
import { categoriesKeys } from "@/src/api/categories/categories.keys";
import { categoriesReq } from "@/src/api/categories/categories.req";
import { useBudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { useInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { usePaymentScheduleSummary } from "@/src/hooks/usePaymentScheduleSummary";
import { ProfitabilityCategory, useProfitabilitySummary } from "@/src/hooks/useProfitabilitySummary";
import { buildStableGroupedItems } from "@/src/lib/budgetGroupedItems";
import { buildStableProfitabilityCategoryMap } from "@/src/lib/stableProfitabilityMap";
import { createBudgetItem, recalculateBudgetItemTotal, recalculateBudgetTotal } from "@/src/lib/budgetFactory";
import { IBudgetValidationResult, validateBudget } from "@/src/lib/budgetValidation";
import { BUDGET_CATEGORIES, Budget, BudgetCategory, BudgetItem, HonorariumPercentage } from "@/src/types";
import {
  ApiBudget,
  BulkUpdateBudgetLinesRequest,
  UpdateBudgetRequest,
} from "@/src/types/api.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

function patchBudgetListEditMetadata(
  queryClient: ReturnType<typeof useQueryClient>,
  budgetId: string,
  updatedAt: string,
  audit?: Pick<ApiBudget, "createdBy" | "updatedBy">,
) {
  queryClient.setQueryData<ApiBudget[]>(budgetsKeys.queries.list, (current) => {
    if (!current) return current;
    return current.map((item) =>
      item.id === budgetId
        ? {
            ...item,
            updatedAt,
            ...(audit?.createdBy !== undefined && { createdBy: audit.createdBy }),
            ...(audit?.updatedBy !== undefined && { updatedBy: audit.updatedBy }),
          }
        : item,
    );
  });
}

// --- Hook ---

export function useBudgetEditor(budgetId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: budgetDetail, isLoading: budgetLoading } = useQuery({
    queryKey: budgetsKeys.queries.detail(budgetId!),
    queryFn: () => budgetsReq.details(budgetId!),
    enabled: !!budgetId,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { data: apiCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: categoriesKeys.queries.list,
    queryFn: categoriesReq.list,
  });

  // IDs das linhas que vieram do backend (para diff no save)
  const originalLineIdsRef = useRef<Set<string>>(new Set());
  const groupedItemsRef = useRef<Record<string, BudgetItem[]>>({});
  const profitabilityCategoryMapRef = useRef<Map<string, ProfitabilityCategory>>(new Map());

  const [budget, setBudget] = useState<Budget | null>(null);

  useEffect(() => {
    if (!budgetDetail) return;
    const items = budgetDetail.lines.map(mapLineToItem);
    setBudget({
      ...mapDetailToBudget(budgetDetail),
      items,
      totalValue: recalculateBudgetTotal(items),
    });
    originalLineIdsRef.current = new Set(budgetDetail.lines.map((l) => l.id));
    groupedItemsRef.current = {};
    profitabilityCategoryMapRef.current = new Map();
  }, [budgetDetail]);

  const isLoading = budgetLoading || categoriesLoading;
  const isLocked = false;

  // Categorias dinâmicas da API; fallback para o catálogo estático enquanto carrega
  const categories = useMemo<BudgetCategory[]>(() => {
    if (apiCategories.length === 0) return BUDGET_CATEGORIES;
    return apiCategories.map((c) => ({
      id: c.code,
      name: `${c.code} - ${c.name}`,
      sectionTitle: c.code.startsWith("2.") ? "Itens faturados via nota fiscal Joy Eventos" : undefined,
    }));
  }, [apiCategories]);

  const budgetItems = budget?.items ?? [];

  const primaryBudgetItems = useMemo(
    () => budgetItems.filter((item) => !item.categoryId.startsWith("2.")),
    [budgetItems],
  );

  const groupedItems = useMemo(() => {
    const groups = buildStableGroupedItems(budgetItems, groupedItemsRef.current);
    groupedItemsRef.current = groups;
    return groups;
  }, [budgetItems]);

  const primaryBudgetCategories = useMemo(() => categories.filter((c) => !c.id.startsWith("2.")), [categories]);

  const internalServiceCategories = useMemo(() => categories.filter((c) => c.id.startsWith("2.")), [categories]);

  const missingCategories = useMemo(
    () => primaryBudgetCategories.filter((c) => !groupedItems[c.id] || groupedItems[c.id].length === 0),
    [primaryBudgetCategories, groupedItems],
  );

  // --- Summaries ---

  const billingSummary = useBudgetBillingSummary(primaryBudgetItems);
  const honorariumPercentage = budget?.honorariumPercentage ?? 10;
  const internalServicesSummary = useInternalServicesSummary(
    budgetItems,
    billingSummary.honorariumBase,
    honorariumPercentage,
  );
  const paymentScheduleSummary = usePaymentScheduleSummary(budgetItems);
  const profitabilitySummary = useProfitabilitySummary({
    primaryItems: primaryBudgetItems,
    categories: primaryBudgetCategories,
    internalItemsTotal: internalServicesSummary.internalItemsTotal,
    honorariumPercentage,
    prazoDias: Number(budget?.deadline) || 0,
    antecipadoCliente: paymentScheduleSummary.totals.paymentAdvance,
  });

  const profitabilityCategoryMap = useMemo(() => {
    const map = buildStableProfitabilityCategoryMap(
      profitabilitySummary?.categories,
      profitabilityCategoryMapRef.current,
    );
    profitabilityCategoryMapRef.current = map;
    return map;
  }, [profitabilitySummary?.categories]);

  const budgetGrandTotal =
    internalServicesSummary.subtotal + internalServicesSummary.serviceTax + billingSummary.totalSuppliers;

  // --- Item actions ---

  const updateItem = useCallback(
    (id: string, field: keyof BudgetItem, value: string | number) => {
      if (isLocked) return;
      startTransition(() => {
        setBudget((prev) => {
          if (!prev) return prev;
          const newItems = prev.items.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, [field]: value };
            if (field === "quantity" || field === "days" || field === "unitPrice") {
              return recalculateBudgetItemTotal(updated);
            }
            return updated;
          });
          return { ...prev, items: newItems, totalValue: recalculateBudgetTotal(newItems) };
        });
      });
    },
    [isLocked],
  );

  const addRow = useCallback(
    (categoryId: string): BudgetItem | null => {
      if (isLocked) return null;
      let newItem: BudgetItem | null = null;
      setBudget((prev) => {
        if (!prev) return prev;
        const categoryItems = prev.items.filter((i) => i.categoryId === categoryId);
        const nextNum =
          categoryItems.length > 0
            ? Math.max(
                ...categoryItems.map((i) => {
                  const parts = i.itemNumber.split(".");
                  return parseInt(parts[parts.length - 1], 10) || 0;
                }),
              ) + 1
            : 1;
        newItem = createBudgetItem(categoryId, `${categoryId}.${nextNum}`);
        return { ...prev, items: [...prev.items, newItem] };
      });
      return newItem;
    },
    [isLocked],
  );

  const deleteRow = useCallback(
    (id: string) => {
      if (isLocked) return;
      setBudget((prev) => {
        if (!prev) return prev;
        const newItems = prev.items.filter((item) => item.id !== id);
        return { ...prev, items: newItems, totalValue: recalculateBudgetTotal(newItems) };
      });
    },
    [isLocked],
  );

  const deleteCategoryItems = useCallback((categoryId: string) => {
    setBudget((prev) => {
      if (!prev) return prev;
      const newItems = prev.items.filter((item) => item.categoryId !== categoryId);
      return { ...prev, items: newItems, totalValue: recalculateBudgetTotal(newItems) };
    });
  }, []);

  const updateBudgetFields = useCallback(
    (updates: Partial<Budget>) => {
      if (isLocked) return;
      startTransition(() => {
        setBudget((prev) => (prev ? { ...prev, ...updates } : prev));
      });
    },
    [isLocked],
  );

  const updateHonorariumPercentageValue = useCallback(
    (value: HonorariumPercentage) => {
      if (isLocked) return;
      startTransition(() => {
        setBudget((prev) => (prev ? { ...prev, honorariumPercentage: value } : prev));
      });
    },
    [isLocked],
  );

  const runValidation = useCallback((): IBudgetValidationResult => {
    if (!budget) return { missingFields: [], inconsistentItems: [] };
    return validateBudget(budget);
  }, [budget]);

  // --- Save ---

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBudgetRequest }) => budgetsReq.update(id, body),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (body: BulkUpdateBudgetLinesRequest) => budgetLinesReq.bulkUpdate(body),
  });

  const saveBudget = useCallback(async (headerOverrides?: Partial<Budget>): Promise<boolean> => {
    const budgetToSave = budget && headerOverrides ? { ...budget, ...headerOverrides } : budget;
    if (!budgetToSave || !budgetId) return false;

    const { missingFields, inconsistentItems } = validateBudget(budgetToSave);
    if (missingFields.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missingFields.join(", ")}`);
      return false;
    }
    if (inconsistentItems.length > 0) {
      toast.error(`${inconsistentItems.length} item(ns) com valor preenchido sem tipo de faturamento`);
      return false;
    }

    if (headerOverrides && budget) {
      setBudget(budgetToSave);
    }

    await updateBudgetMutation.mutateAsync({
      id: budgetId,
      body: mapBudgetToUpdateRequest(budgetToSave),
    });

    const bulk = buildBulkRequest(budgetToSave.items, originalLineIdsRef.current, budgetId);
    if (bulk.create?.length || bulk.update?.length || bulk.delete?.length) {
      const savedLines = await bulkUpdateMutation.mutateAsync(bulk);
      const newlyCreatedIds = savedLines.map((l) => l.id);
      const survivingOriginalIds = [...originalLineIdsRef.current].filter((id) => !bulk.delete?.includes(id));
      originalLineIdsRef.current = new Set([...survivingOriginalIds, ...newlyCreatedIds]);
    }

    await queryClient.invalidateQueries({ queryKey: budgetsKeys.queries.detail(budgetId) });
    const detail = await queryClient.fetchQuery({
      queryKey: budgetsKeys.queries.detail(budgetId),
      queryFn: () => budgetsReq.details(budgetId),
      staleTime: 0,
    });

    const items = detail.lines.map(mapLineToItem);
    setBudget({
      ...mapDetailToBudget(detail),
      items,
      totalValue: recalculateBudgetTotal(items),
    });
    originalLineIdsRef.current = new Set(detail.lines.map((l) => l.id));

    patchBudgetListEditMetadata(queryClient, budgetId, detail.updatedAt ?? detail.createdAt, {
      createdBy: detail.createdBy,
      updatedBy: detail.updatedBy,
    });
    toast.success("Orçamento salvo com sucesso!");
    return true;
  }, [budget, budgetId, updateBudgetMutation, bulkUpdateMutation, queryClient]);

  const handleApprove = useCallback(async (): Promise<void> => {
    if (!budget) return;
    const saved = await saveBudget();
    if (!saved) throw new Error("Falha ao salvar antes de aprovar.");
    toast.success("Aprovação será integrada na próxima fase.");
  }, [budget, saveBudget]);

  return {
    budget,
    isLoading,
    isLocked,
    budgetItems,
    categories,
    primaryBudgetItems,
    groupedItems,
    primaryBudgetCategories,
    internalServiceCategories,
    missingCategories,
    billingSummary,
    internalServicesSummary,
    paymentScheduleSummary,
    profitabilitySummary,
    profitabilityCategoryMap,
    budgetGrandTotal,
    honorariumPercentage,
    updateItem,
    addRow,
    deleteRow,
    deleteCategoryItems,
    updateBudgetFields,
    updateHonorariumPercentage: updateHonorariumPercentageValue,
    runValidation,
    saveBudget,
    handleApprove,
  };
}
