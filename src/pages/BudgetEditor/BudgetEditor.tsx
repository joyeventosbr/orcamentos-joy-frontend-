import { createBudgetItem, recalculateBudgetItemTotal, recalculateBudgetTotal } from "@/src/lib/budgetFactory";
import { useBudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { useInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { usePaymentScheduleSummary } from "@/src/hooks/usePaymentScheduleSummary";
import { BUDGET_CATEGORIES, Budget, BudgetItem, HonorariumPercentage } from "@/src/types";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { BudgetEditorHeader } from "./components/BudgetEditorHeader";
import { BudgetSpreadsheet } from "./components/BudgetSpreadsheet";
import { BudgetSummaryPanel } from "./components/BudgetSummaryPanel";
import { DeleteCategoryModal } from "./components/DeleteCategoryModal";

export function BudgetEditor() {
  const navigate = useNavigate();
  const { budgetId } = useParams<{ budgetId: string }>();
  const { budgets, isLoading, updateBudget } = useAppData();

  // Find initial budget from context
  const initialBudget = useMemo(() => {
    return budgets.find((b) => b.id === budgetId) || budgets[0] || null;
  }, [budgets, budgetId]);

  const [budget, setBudget] = useState<Budget | null>(initialBudget);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof BudgetItem;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Update effect if budget changes externally or loads
  useEffect(() => {
    if (initialBudget) {
      setBudget(initialBudget);
    }
  }, [initialBudget]);

  const budgetItems = budget?.items ?? [];
  const primaryBudgetItems = budgetItems.filter((item) => !item.categoryId.startsWith("2."));

  // Group items by categoryId to maintain the 1.1 -> 1.12 order
  const groupedItems = useMemo(() => {
    const groups: Record<string, BudgetItem[]> = {};
    budgetItems.forEach((item) => {
      if (!groups[item.categoryId]) groups[item.categoryId] = [];
      groups[item.categoryId].push(item);
    });
    return groups;
  }, [budgetItems]);

  // Initialize expanded state for categories that have items
  React.useEffect(() => {
    const newExpanded = { ...expandedCategories };
    let changed = false;
    BUDGET_CATEGORIES.forEach((cat) => {
      if (newExpanded[cat.id] === undefined) {
        newExpanded[cat.id] = true;
        changed = true;
      }
    });
    Object.keys(groupedItems).forEach((catId) => {
      if (newExpanded[catId] === undefined) {
        newExpanded[catId] = true;
        changed = true;
      }
    });
    if (changed) setExpandedCategories(newExpanded);
  }, [groupedItems]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setBudget((prev) => {
      if (!prev) return prev;

      const newItems = prev.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Auto-calculate total if quantity, days or unitPrice changes
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

  const addRow = (categoryId: string) => {
    if (!budget) return;

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

      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });

    // Auto-expand category and set focus to new row name
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: true }));
    setEditingCell({ id: newItem.id, field: "name" });
  };

  const deleteRow = (id: string) => {
    setBudget((prev) => {
      if (!prev) return prev;

      const newItems = prev.items.filter((item) => item.id !== id);
      return {
        ...prev,
        items: newItems,
        totalValue: recalculateBudgetTotal(newItems),
      };
    });
  };

  const deleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      setBudget((prev) => {
        if (!prev) return prev;

        const newItems = prev.items.filter((item) => item.categoryId !== categoryToDelete);
        return {
          ...prev,
          items: newItems,
          totalValue: recalculateBudgetTotal(newItems),
        };
      });
      setCategoryToDelete(null);
    }
  };

  const handleCellClick = (id: string, field: keyof BudgetItem) => {
    setEditingCell({ id, field });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleBudgetChange = (updates: Partial<Budget>) => {
    setBudget((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const updateHonorariumPercentage = (value: HonorariumPercentage) => {
    setBudget((prev) => {
      if (!prev) return prev;
      return { ...prev, honorariumPercentage: value };
    });
  };

  const primaryBudgetCategories = BUDGET_CATEGORIES.filter((category) => !category.id.startsWith("2."));
  const internalServiceCategories = BUDGET_CATEGORIES.filter((category) => category.id.startsWith("2."));

  const missingCategories = primaryBudgetCategories.filter(
    (c) => !groupedItems[c.id] || groupedItems[c.id].length === 0,
  );

  const billingSummary = useBudgetBillingSummary(primaryBudgetItems);
  const honorariumPercentage = budget?.honorariumPercentage ?? 10;
  const internalServicesSummary = useInternalServicesSummary(
    budgetItems,
    billingSummary.honorariumBase,
    honorariumPercentage,
  );
  const paymentScheduleSummary = usePaymentScheduleSummary(budgetItems);
  const budgetGrandTotal =
    internalServicesSummary.subtotal + internalServicesSummary.serviceTax + billingSummary.totalSuppliers;

  const handleSave = async () => {
    if (!budget) return;

    await updateBudget(budget.id, {
      ...budget,
      totalValue: budgetGrandTotal,
    });
    toast.success("Orçamento salvo com sucesso!");
  };

  if (isLoading || !budget) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Carregando orçamento</div>
          <div className="mt-2 text-sm text-slate-500">Simulando busca dos dados locais.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <BudgetEditorHeader
        budget={budget}
        isSidebarOpen={isSidebarOpen}
        onBudgetChange={handleBudgetChange}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSave={handleSave}
        onNavigateBack={() => navigate("/")}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col bg-slate-50/50 min-w-0 min-h-0">
          <BudgetSpreadsheet
            primaryCategories={primaryBudgetCategories}
            internalServiceCategories={internalServiceCategories}
            groupedItems={groupedItems}
            expandedCategories={expandedCategories}
            missingCategories={missingCategories}
            editingCell={editingCell}
            onToggleCategory={toggleCategory}
            onAddRow={addRow}
            onDeleteCategory={deleteCategory}
            onDeleteRow={deleteRow}
            onCellClick={handleCellClick}
            onCellBlur={handleCellBlur}
            onUpdate={updateItem}
          />
        </div>

        <BudgetSummaryPanel
          isOpen={isSidebarOpen}
          grandTotal={budgetGrandTotal}
          billingSummary={billingSummary}
          paymentTotals={paymentScheduleSummary.totals}
          internalServicesSummary={internalServicesSummary}
          honorariumBase={billingSummary.honorariumBase}
          honorariumPercentage={honorariumPercentage}
          advancePayment={paymentScheduleSummary.totals.paymentAdvance}
          onHonorariumPercentageChange={updateHonorariumPercentage}
        />
      </div>

      {categoryToDelete && (
        <DeleteCategoryModal
          onConfirm={confirmDeleteCategory}
          onCancel={() => setCategoryToDelete(null)}
        />
      )}
    </div>
  );
}
