import { budgetLinesReq } from "@/src/api/budget-lines/budget-lines.req";
import { fetchBudgetDetailFresh, refreshBudgetCaches } from "@/src/api/budgets/budgets.cache";
import { budgetsKeys } from "@/src/api/budgets/budgets.keys";
import {
  buildBulkRequest,
  mapBudgetToUpdateRequest,
  mapDetailToBudget,
  mapLineToItem,
  serializeBudgetForDirtyCheck,
} from "@/src/api/budgets/budgets.mappers";
import { budgetsReq } from "@/src/api/budgets/budgets.req";
import { categoriesKeys } from "@/src/api/categories/categories.keys";
import { categoriesReq } from "@/src/api/categories/categories.req";
import { useBudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { useInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { usePaymentScheduleSummary } from "@/src/hooks/usePaymentScheduleSummary";
import { ProfitabilityCategory, useProfitabilitySummary } from "@/src/hooks/useProfitabilitySummary";
import { createBudgetItem, recalculateBudgetItemTotal, recalculateBudgetTotal } from "@/src/lib/budgetFactory";
import { buildStableGroupedItems } from "@/src/lib/budgetGroupedItems";
import { isBudgetApproved } from "@/src/lib/budgetStatus";
import {
  getBudgetApprovalError,
  getProfitabilityApprovalError,
  IBudgetValidationResult,
  validateBudget,
} from "@/src/lib/budgetValidation";
import { resolveTaxNfFactor } from "@/src/lib/profitability";
import { DEFAULT_PROFITABILITY_RATES } from "@/src/lib/profitabilityRates";
import { buildStableProfitabilityCategoryMap } from "@/src/lib/stableProfitabilityMap";
import {
  Budget,
  BUDGET_CATEGORIES,
  BudgetCategory,
  BudgetItem,
  HonorariumPercentage,
} from "@/src/types";
import { BulkUpdateBudgetLinesRequest, UpdateBudgetRequest } from "@/src/types/api.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

// --- Hook ---

export function useBudgetEditor(budgetId: string | undefined, isAdmin = false) {
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
  const savedSnapshotRef = useRef("");
  const groupedItemsRef = useRef<Record<string, BudgetItem[]>>({});
  const profitabilityCategoryMapRef = useRef<Map<string, ProfitabilityCategory>>(new Map());

  const [budget, setBudget] = useState<Budget | null>(null);

  useEffect(() => {
    if (!budgetDetail) return;
    const items = budgetDetail.lines.map(mapLineToItem);
    const nextBudget = {
      ...mapDetailToBudget(budgetDetail),
      items,
      totalValue: recalculateBudgetTotal(items),
    };
    setBudget(nextBudget);
    originalLineIdsRef.current = new Set(budgetDetail.lines.map((l) => l.id));
    savedSnapshotRef.current = serializeBudgetForDirtyCheck(nextBudget);
    groupedItemsRef.current = {};
    profitabilityCategoryMapRef.current = new Map();
  }, [budgetDetail]);

  const isLoading = budgetLoading || categoriesLoading;
  const isLocked = budget ? !budget.isEditable : false;
  const isBillingTypeLocked = budget ? isBudgetApproved(budget.status) : false;

  const isDirty = useMemo(() => {
    if (!budget || isLocked) return false;
    return serializeBudgetForDirtyCheck(budget) !== savedSnapshotRef.current;
  }, [budget, isLocked]);

  // Categorias dinâmicas da API; fallback para o catálogo estático enquanto carrega
  const categories = useMemo<BudgetCategory[]>(() => {
    if (apiCategories.length === 0) return BUDGET_CATEGORIES;
    return apiCategories.map((c) => ({
      id: c.code,
      name: `${c.code} - ${c.name}`,
    }));
  }, [apiCategories]);

  const budgetItems = budget?.items ?? [];

  const primaryBudgetItems = useMemo(
    () => budgetItems.filter((item) => !item.categoryId.startsWith("2.")),
    [budgetItems],
  );

  const internalBudgetItems = useMemo(
    () => budgetItems.filter((item) => item.categoryId.startsWith("2.")),
    [budgetItems],
  );

  const groupedItems = useMemo(() => {
    const groups = buildStableGroupedItems(budgetItems, groupedItemsRef.current);
    groupedItemsRef.current = groups;
    return groups;
  }, [budgetItems]);

  const primaryBudgetCategories = useMemo(() => categories.filter((c) => !c.id.startsWith("2.")), [categories]);

  const internalServiceCategories = useMemo(() => categories.filter((c) => c.id.startsWith("2.")), [categories]);

  const profitabilityCategories = useMemo(
    () => [...primaryBudgetCategories, ...internalServiceCategories],
    [primaryBudgetCategories, internalServiceCategories],
  );

  const missingCategories = useMemo(
    () => primaryBudgetCategories.filter((c) => !groupedItems[c.id] || groupedItems[c.id].length === 0),
    [primaryBudgetCategories, groupedItems],
  );

  // --- Summaries ---

  const taxNfFactor = resolveTaxNfFactor(budget?.taxNf);
  const taxNfRate = taxNfFactor > 0 ? 1 - taxNfFactor : 0;
  const profitabilityRates = useMemo(
    () => ({
      ...DEFAULT_PROFITABILITY_RATES,
      nfJoyTaxRate: taxNfRate,
      nfServicesTaxRate: taxNfRate,
    }),
    [taxNfRate],
  );

  const billingSummary = useBudgetBillingSummary(primaryBudgetItems, taxNfRate);
  const paymentScheduleSummary = usePaymentScheduleSummary(budgetItems);
  const honorariumPercentage = budget?.honorariumPercentage ?? 10;
  const prazoDias = Number(budget?.deadline) || 0;
  const antecipadoCliente = paymentScheduleSummary.totals.paymentAdvance;
  const fatViaJoy = billingSummary.metrics.find((metric) => metric.key === "joy")?.amount ?? 0;
  const internalServicesSummary = useInternalServicesSummary(
    budgetItems,
    budget?.projectedValue ?? 0,
    billingSummary.honorariumBase,
    honorariumPercentage,
    fatViaJoy,
    antecipadoCliente,
    prazoDias,
    taxNfRate,
  );
  const profitabilitySummary = useProfitabilitySummary({
    primaryItems: primaryBudgetItems,
    internalServiceItems: internalBudgetItems,
    categories: profitabilityCategories,
    internalServicesSubtotal: internalServicesSummary.internalItemsTotal + internalServicesSummary.planning,
    honorariumPercentage,
    prazoDias,
    antecipadoCliente,
    rates: profitabilityRates,
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
    (id: string, field: keyof BudgetItem, value: string | number | null) => {
      if (isLocked) return;
      if (field === "billingType" && isBillingTypeLocked) return;
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
    [isLocked, isBillingTypeLocked],
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
    if (!budget) {
      return { missingFields: [], inconsistentItems: [], itemsMissingQtyOrDays: [], itemsMissingName: [] };
    }
    return validateBudget(budget);
  }, [budget]);

  // --- Save ---

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBudgetRequest }) => budgetsReq.update(id, body),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (body: BulkUpdateBudgetLinesRequest) => budgetLinesReq.bulkUpdate(body),
  });

  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveBudget = useCallback(
    async (headerOverrides?: Partial<Budget>): Promise<boolean> => {
      if (isSavingRef.current) return false;

      const budgetToSave = budget && headerOverrides ? { ...budget, ...headerOverrides } : budget;
      if (!budgetToSave || !budgetId) return false;

      isSavingRef.current = true;
      setIsSaving(true);

      try {
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

        await refreshBudgetCaches(queryClient, budgetId);
        const detail = await fetchBudgetDetailFresh(queryClient, budgetId);

        const items = detail.lines.map(mapLineToItem);
        const refreshedBudget = {
          ...mapDetailToBudget(detail),
          items,
          totalValue: recalculateBudgetTotal(items),
        };
        setBudget(refreshedBudget);
        originalLineIdsRef.current = new Set(detail.lines.map((l) => l.id));
        savedSnapshotRef.current = serializeBudgetForDirtyCheck(refreshedBudget);

        toast.success("Orçamento salvo com sucesso!");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao salvar orçamento.");
        return false;
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [budget, budgetId, updateBudgetMutation, bulkUpdateMutation, queryClient],
  );

  const approveMutation = useMutation({
    mutationFn: () => budgetsReq.approve(budgetId!),
  });

  const approveToProductionMutation = useMutation({
    mutationFn: () => budgetsReq.approveToProduction(budgetId!),
  });

  const handleApprove = useCallback(async (): Promise<boolean> => {
    if (!budget || !budgetId) return false;

    const approvalError = getBudgetApprovalError(validateBudget(budget));
    if (approvalError) {
      toast.error(approvalError);
      return false;
    }

    const profitabilityError = getProfitabilityApprovalError(profitabilitySummary.rentabilidadeProd, isAdmin);
    if (profitabilityError) {
      toast.error(profitabilityError);
      return false;
    }

    const saved = await saveBudget();
    if (!saved) return false;

    try {
      const created = await approveMutation.mutateAsync();

      await refreshBudgetCaches(queryClient, budgetId);
      const detail = await fetchBudgetDetailFresh(queryClient, budgetId);

      const items = detail.lines.map(mapLineToItem);
      const refreshedBudget = {
        ...mapDetailToBudget(detail),
        items,
        totalValue: recalculateBudgetTotal(items),
      };
      setBudget(refreshedBudget);
      originalLineIdsRef.current = new Set(detail.lines.map((l) => l.id));
      savedSnapshotRef.current = serializeBudgetForDirtyCheck(refreshedBudget);

      const countLabel = created.length === 2 ? "2 versões" : "1 versão";
      toast.success(`Aprovação concluída. ${countLabel} criada(s) na pasta.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao aprovar orçamento.");
      throw error;
    }
  }, [budget, budgetId, profitabilitySummary.rentabilidadeProd, isAdmin, saveBudget, approveMutation, queryClient]);

  const handleApproveToProduction = useCallback(async (): Promise<string | null> => {
    if (!budget || !budgetId) throw new Error("Orçamento não encontrado.");

    const approvalError = getBudgetApprovalError(validateBudget(budget));
    if (approvalError) {
      toast.error(approvalError);
      return null;
    }

    const profitabilityError = getProfitabilityApprovalError(profitabilitySummary.rentabilidadeProd, isAdmin);
    if (profitabilityError) {
      toast.error(profitabilityError);
      return null;
    }

    const saved = await saveBudget();
    if (!saved) return null;

    try {
      const created = await approveToProductionMutation.mutateAsync();

      await refreshBudgetCaches(queryClient, budgetId);
      toast.success("Orçamento enviado para Produção.");
      return created.id;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao aprovar para produção.");
      throw error;
    }
  }, [
    budget,
    budgetId,
    profitabilitySummary.rentabilidadeProd,
    isAdmin,
    saveBudget,
    approveToProductionMutation,
    queryClient,
  ]);

  return {
    budget,
    budgetDetail,
    isLoading,
    isLocked,
    isBillingTypeLocked,
    isDirty,
    isSaving,
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
    handleApproveToProduction,
  };
}
