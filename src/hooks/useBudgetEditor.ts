import { budgetLinesReq } from "@/src/api/budget-lines/budget-lines.req";
import { budgetsKeys } from "@/src/api/budgets/budgets.keys";
import { budgetsReq } from "@/src/api/budgets/budgets.req";
import { categoriesKeys } from "@/src/api/categories/categories.keys";
import { categoriesReq } from "@/src/api/categories/categories.req";
import { useBudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { useInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { usePaymentScheduleSummary } from "@/src/hooks/usePaymentScheduleSummary";
import { useProfitabilitySummary } from "@/src/hooks/useProfitabilitySummary";
import { createBudgetItem, recalculateBudgetItemTotal, recalculateBudgetTotal } from "@/src/lib/budgetFactory";
import { IBudgetValidationResult, validateBudget } from "@/src/lib/budgetValidation";
import { BUDGET_CATEGORIES, Budget, BudgetCategory, BudgetItem, HonorariumPercentage } from "@/src/types";
import {
  ApiBudget,
  BillingType,
  BudgetDetail,
  BudgetEditorInfo,
  BudgetLine,
  BulkUpdateBudgetLinesRequest,
  CreateBudgetLineRequest,
  PaymentTerm,
  UpdateBudgetLineRequest,
  UpdateBudgetRequest,
} from "@/src/types/api.types";
import { useAuthStore } from "@/src/store/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

// --- Mappers ---

const PAYMENT_TERM_TO_DEADLINE: Record<PaymentTerm, string> = {
  [PaymentTerm.THIRTY_DAYS]: "30",
  [PaymentTerm.FORTY_FIVE_DAYS]: "45",
  [PaymentTerm.SIXTY_DAYS]: "60",
  [PaymentTerm.NINETY_DAYS]: "90",
  [PaymentTerm.ONE_HUNDRED_TWENTY_DAYS]: "120",
};

const DEADLINE_TO_PAYMENT_TERM: Record<string, PaymentTerm> = {
  "30": PaymentTerm.THIRTY_DAYS,
  "45": PaymentTerm.FORTY_FIVE_DAYS,
  "60": PaymentTerm.SIXTY_DAYS,
  "90": PaymentTerm.NINETY_DAYS,
  "120": PaymentTerm.ONE_HUNDRED_TWENTY_DAYS,
};

function emptyToUndefined(value?: string): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function getCurrentEditorInfo(): BudgetEditorInfo | undefined {
  const user = useAuthStore.getState().currentUser;
  if (!user) return undefined;
  return { name: user.name, email: user.email };
}

function patchBudgetListEditMetadata(
  queryClient: ReturnType<typeof useQueryClient>,
  budgetId: string,
  updatedAt: string,
  lastEditedBy?: BudgetEditorInfo,
) {
  queryClient.setQueryData<ApiBudget[]>(budgetsKeys.queries.list, (current) => {
    if (!current) return current;
    return current.map((item) =>
      item.id === budgetId ? { ...item, updatedAt, ...(lastEditedBy ? { lastEditedBy } : {}) } : item,
    );
  });
}

function mapDetailToBudget(detail: BudgetDetail): Budget {
  return {
    id: detail.id,
    jobId: detail.folderId,
    name: detail.name,
    status: "Concorrência",
    phase: "concorrencia",
    isLocked: false,
    totalValue: 0,
    lastUpdated: detail.updatedAt ?? detail.createdAt,
    lastEditedBy: detail.lastEditedBy,
    items: [],
    client: detail.customerName,
    job: detail.jobDescription ?? "",
    deadline: detail.paymentTerm ? PAYMENT_TERM_TO_DEADLINE[detail.paymentTerm] : "",
    location: detail.location ?? "",
    date: detail.eventDate ?? "",
    participants: detail.participants ?? "",
    taxNf: detail.taxNf,
  };
}

function mapLineToItem(line: BudgetLine): BudgetItem {
  return {
    id: line.id,
    categoryId: line.categoryCode,
    itemNumber: `${line.categoryCode}.${line.order}`,
    name: line.name,
    description: line.description,
    billingType: (line.billingType ?? "") as BudgetItem["billingType"],
    quantity: line.quantity,
    days: line.dailyRates,
    unitPrice: line.unitValue,
    total: line.totalValue,
    paymentAdvance: line.upfrontPayment,
    payment30d: line.installment30Days,
    payment45d: line.installment45Days,
    payment60d: line.installment60Days,
    payment90d: line.installment90Days,
    payment120d: line.installment120Days ?? 0,
    fornecedorName: line.supplier ?? "",
    fornecedorValue: line.supplierValue ?? 0,
    percentBV: line.percentBv ?? 0,
    percentNfOver: line.percentNfOver ?? 0,
  };
}

function toApiBillingType(billingType: BudgetItem["billingType"]): BillingType | null {
  if (!billingType) return null;
  return billingType as BillingType;
}

function toApiSupplier(name: string): string | null {
  const trimmed = name.trim();
  return trimmed === "" ? null : trimmed;
}

function mapItemProfitabilityToApi(item: BudgetItem) {
  return {
    supplier: toApiSupplier(item.fornecedorName),
    supplierValue: item.fornecedorValue,
    percentBv: item.percentBV,
    percentNfOver: item.percentNfOver,
  };
}

function extractOrder(itemNumber: string): number {
  const parts = itemNumber.split(".");
  const last = parts[parts.length - 1];
  return parseInt(last, 10) || 0;
}

function mapItemToCreateRequest(item: BudgetItem, budgetId: string): CreateBudgetLineRequest {
  return {
    budgetId,
    categoryCode: item.categoryId,
    order: extractOrder(item.itemNumber),
    name: item.name,
    description: item.description,
    billingType: toApiBillingType(item.billingType),
    quantity: item.quantity,
    dailyRates: item.days,
    unitValue: item.unitPrice,
    totalValue: item.total,
    upfrontPayment: item.paymentAdvance,
    installment30Days: item.payment30d,
    installment45Days: item.payment45d,
    installment60Days: item.payment60d,
    installment90Days: item.payment90d,
    installment120Days: item.payment120d,
    ...mapItemProfitabilityToApi(item),
  };
}

function mapItemToUpdateRequest(item: BudgetItem): UpdateBudgetLineRequest & { id: string } {
  return {
    id: item.id,
    categoryCode: item.categoryId,
    order: extractOrder(item.itemNumber),
    name: item.name,
    description: item.description,
    billingType: toApiBillingType(item.billingType),
    quantity: item.quantity,
    dailyRates: item.days,
    unitValue: item.unitPrice,
    totalValue: item.total,
    upfrontPayment: item.paymentAdvance,
    installment30Days: item.payment30d,
    installment45Days: item.payment45d,
    installment60Days: item.payment60d,
    installment90Days: item.payment90d,
    installment120Days: item.payment120d,
    ...mapItemProfitabilityToApi(item),
  };
}

function mapBudgetToUpdateRequest(budget: Budget): UpdateBudgetRequest {
  return {
    name: budget.name,
    jobDescription: budget.job,
    location: emptyToUndefined(budget.location),
    eventDate: emptyToUndefined(budget.date),
    participants: emptyToUndefined(budget.participants),
    paymentTerm: budget.deadline ? DEADLINE_TO_PAYMENT_TERM[budget.deadline] : undefined,
  };
}

function buildBulkRequest(
  currentItems: BudgetItem[],
  originalIds: Set<string>,
  budgetId: string,
): BulkUpdateBudgetLinesRequest {
  const currentIds = new Set(currentItems.map((i) => i.id));

  const toCreate = currentItems.filter((i) => !originalIds.has(i.id)).map((i) => mapItemToCreateRequest(i, budgetId));

  const toUpdate = currentItems.filter((i) => originalIds.has(i.id)).map((i) => mapItemToUpdateRequest(i));

  const toDelete = [...originalIds].filter((id) => !currentIds.has(id));

  return {
    ...(toCreate.length > 0 && { create: toCreate }),
    ...(toUpdate.length > 0 && { update: toUpdate }),
    ...(toDelete.length > 0 && { delete: toDelete }),
  };
}

// --- Hook ---

export function useBudgetEditor(budgetId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: budgetDetail, isLoading: budgetLoading } = useQuery({
    queryKey: ["budgets", "detail", budgetId],
    queryFn: () => budgetsReq.details(budgetId!),
    enabled: !!budgetId,
  });

  const { data: apiCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: categoriesKeys.queries.list,
    queryFn: categoriesReq.list,
  });

  // IDs das linhas que vieram do backend (para diff no save)
  const originalLineIdsRef = useRef<Set<string>>(new Set());

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
    const groups: Record<string, BudgetItem[]> = {};
    budgetItems.forEach((item) => {
      if (!groups[item.categoryId]) groups[item.categoryId] = [];
      groups[item.categoryId].push(item);
    });
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
    internalItemsTotal: internalServicesSummary.internalItemsTotal,
    honorariumPercentage,
    prazoDias: Number(budget?.deadline) || 0,
    antecipadoCliente: paymentScheduleSummary.totals.paymentAdvance,
  });
  const budgetGrandTotal =
    internalServicesSummary.subtotal + internalServicesSummary.serviceTax + billingSummary.totalSuppliers;

  // --- Item actions ---

  const updateItem = useCallback(
    (id: string, field: keyof BudgetItem, value: string | number) => {
      if (isLocked) return;
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
      setBudget((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    [isLocked],
  );

  const updateHonorariumPercentageValue = useCallback(
    (value: HonorariumPercentage) => {
      if (isLocked) return;
      setBudget((prev) => (prev ? { ...prev, honorariumPercentage: value } : prev));
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

  const saveBudget = useCallback(async (): Promise<boolean> => {
    if (!budget || !budgetId) return false;

    const { missingFields, inconsistentItems } = validateBudget(budget);
    if (missingFields.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missingFields.join(", ")}`);
      return false;
    }
    if (inconsistentItems.length > 0) {
      toast.error(`${inconsistentItems.length} item(ns) com valor preenchido sem tipo de faturamento`);
      return false;
    }

    const updatedBudget = await updateBudgetMutation.mutateAsync({
      id: budgetId,
      body: mapBudgetToUpdateRequest(budget),
    });

    const bulk = buildBulkRequest(budget.items, originalLineIdsRef.current, budgetId);
    if (bulk.create?.length || bulk.update?.length || bulk.delete?.length) {
      const savedLines = await bulkUpdateMutation.mutateAsync(bulk);
      // Atualiza os IDs originais após o save para o próximo diff ser correto
      const newlyCreatedIds = savedLines.map((l) => l.id);
      const survivingOriginalIds = [...originalLineIdsRef.current].filter((id) => !bulk.delete?.includes(id));
      originalLineIdsRef.current = new Set([...survivingOriginalIds, ...newlyCreatedIds]);
    }

    const lastEditedBy = updatedBudget.lastEditedBy ?? getCurrentEditorInfo();
    const lastUpdated = updatedBudget.updatedAt ?? new Date().toISOString();

    setBudget((prev) =>
      prev ? { ...prev, lastUpdated, ...(lastEditedBy ? { lastEditedBy } : {}) } : prev,
    );
    patchBudgetListEditMetadata(queryClient, budgetId, lastUpdated, lastEditedBy);

    queryClient.invalidateQueries({ queryKey: ["budgets", "detail", budgetId] });
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
