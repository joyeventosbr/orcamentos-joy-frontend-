import { useAppData } from "@/src/context/AppDataContext";
import { useBudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { useInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { usePaymentScheduleSummary } from "@/src/hooks/usePaymentScheduleSummary";
import { useProfitabilitySummary } from "@/src/hooks/useProfitabilitySummary";
import { createBudgetItem, recalculateBudgetItemTotal, recalculateBudgetTotal } from "@/src/lib/budgetFactory";
import { IBudgetValidationResult, validateBudget } from "@/src/lib/budgetValidation";
import { BUDGET_CATEGORIES, Budget, BudgetItem, HonorariumPercentage } from "@/src/types";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export function useBudgetEditor(budgetId: string | undefined) {
  const { budgets, isLoading, updateBudget, approveBudget } = useAppData();

  const initialBudget = useMemo(() => {
    return budgets.find((b) => b.id === budgetId) || budgets[0] || null;
  }, [budgets, budgetId]);

  const [budget, setBudget] = useState<Budget | null>(initialBudget);

  useEffect(() => {
    if (initialBudget) {
      setBudget(initialBudget);
    }
  }, [initialBudget]);

  const isLocked = budget?.isLocked ?? false;
  const budgetItems = budget?.items ?? [];
  const primaryBudgetItems = budgetItems.filter((item) => !item.categoryId.startsWith("2."));

  const groupedItems = useMemo(() => {
    const groups: Record<string, BudgetItem[]> = {};
    budgetItems.forEach((item) => {
      if (!groups[item.categoryId]) groups[item.categoryId] = [];
      groups[item.categoryId].push(item);
    });
    return groups;
  }, [budgetItems]);

  const primaryBudgetCategories = BUDGET_CATEGORIES.filter((c) => !c.id.startsWith("2."));

  const internalServiceCategories = BUDGET_CATEGORIES.filter((c) => c.id.startsWith("2."));

  const missingCategories = primaryBudgetCategories.filter(
    (c) => !groupedItems[c.id] || groupedItems[c.id].length === 0,
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

  const profitabilitySummary = useProfitabilitySummary(
    primaryBudgetItems,
    internalServicesSummary.subtotal,
    internalServicesSummary.subtotal + internalServicesSummary.serviceTax + billingSummary.totalSuppliers,
  );
  const budgetGrandTotal =
    internalServicesSummary.subtotal + internalServicesSummary.serviceTax + billingSummary.totalSuppliers;

  // --- Actions ---

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    if (isLocked) return;
    setBudget((prev) => {
      if (!prev) return prev;

      const newItems = prev.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "days" || field === "unitPrice") {
            return recalculateBudgetItemTotal(updated);
          }
          return updated;
        }
        return item;
      });

      return {
        ...prev,
        items: newItems,
        totalValue: recalculateBudgetTotal(newItems),
      };
    });
  };

  const addRow = (categoryId: string): BudgetItem | null => {
    if (!budget || isLocked) return null;

    const categoryItems = budget.items.filter((i) => i.categoryId === categoryId);
    let nextNum = 1;
    if (categoryItems.length > 0) {
      const nums = categoryItems.map((i) => {
        const parts = i.itemNumber.split(".");
        return parseInt(parts[parts.length - 1], 10) || 0;
      });
      nextNum = Math.max(...nums) + 1;
    }

    const newItem = createBudgetItem(categoryId, `${categoryId}.${nextNum}`);

    setBudget((prev) => {
      if (!prev) return prev;
      return { ...prev, items: [...prev.items, newItem] };
    });

    return newItem;
  };

  const deleteRow = (id: string) => {
    if (isLocked) return;
    setBudget((prev) => {
      if (!prev) return prev;
      const newItems = prev.items.filter((item) => item.id !== id);
      return { ...prev, items: newItems, totalValue: recalculateBudgetTotal(newItems) };
    });
  };

  const deleteCategoryItems = (categoryId: string) => {
    setBudget((prev) => {
      if (!prev) return prev;
      const newItems = prev.items.filter((item) => item.categoryId !== categoryId);
      return { ...prev, items: newItems, totalValue: recalculateBudgetTotal(newItems) };
    });
  };

  const updateBudgetFields = (updates: Partial<Budget>) => {
    if (isLocked) return;
    setBudget((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const updateHonorariumPercentageValue = (value: HonorariumPercentage) => {
    if (isLocked) return;
    setBudget((prev) => {
      if (!prev) return prev;
      return { ...prev, honorariumPercentage: value };
    });
  };

  const runValidation = (): IBudgetValidationResult => {
    if (!budget) return { missingFields: [], inconsistentItems: [] };
    return validateBudget(budget);
  };

  const saveBudget = async (): Promise<boolean> => {
    if (!budget || isLocked) return false;

    const { missingFields, inconsistentItems } = validateBudget(budget);

    if (missingFields.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missingFields.join(", ")}`);
      return false;
    }

    if (inconsistentItems.length > 0) {
      toast.error(`${inconsistentItems.length} item(ns) com valor preenchido sem tipo de faturamento`);
      return false;
    }

    await updateBudget(budget.id, {
      ...budget,
      totalValue: budgetGrandTotal,
    });
    toast.success("Orçamento salvo com sucesso!");
    return true;
  };

  const handleApprove = async (): Promise<void> => {
    if (!budget) return;

    const saved = await saveBudget();
    if (!saved) throw new Error("Falha ao salvar antes de aprovar.");

    const result = await approveBudget(budget.id);

    if (result.productionCopy) {
      toast.success("Cópia aprovada criada! Cópia de produção também criada automaticamente.");
    } else {
      toast.success("Cópia aprovada de produção criada!");
    }
  };

  return {
    budget,
    isLoading,
    isLocked,
    budgetItems,
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
