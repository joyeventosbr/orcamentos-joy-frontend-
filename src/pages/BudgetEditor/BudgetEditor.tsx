import { PageLoader } from "@/src/components/ui/PageLoader/PageLoader";
import { ExcelExportVariant, exportBudgetToExcel } from "@/src/lib/budgetExcelExport";
import { useBudgetEditor } from "@/src/hooks/useBudgetEditor";
import { Budget, BudgetItem } from "@/src/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { BudgetEditorSidebars } from "./BudgetEditorSidebars";
import { BudgetEditorSpreadsheetArea } from "./BudgetEditorSpreadsheetArea";
import { ApprovalConfirmModal } from "./components/ApprovalConfirmModal";
import { BudgetEditorHeader } from "./components/BudgetEditorHeader";
import { DeleteCategoryModal } from "./components/DeleteCategoryModal";

export function BudgetEditor() {
  const navigate = useNavigate();
  const { budgetId } = useParams<{ budgetId: string }>();

  const editor = useBudgetEditor(budgetId);

  // --- UI-only State ---
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof BudgetItem } | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<"summary" | "profitability" | null>("summary");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  useEffect(() => {
    const newExpanded = { ...expandedCategories };
    let changed = false;
    editor.categories.forEach((cat) => {
      if (newExpanded[cat.id] === undefined) {
        newExpanded[cat.id] = true;
        changed = true;
      }
    });
    Object.keys(editor.groupedItems).forEach((catId) => {
      if (newExpanded[catId] === undefined) {
        newExpanded[catId] = true;
        changed = true;
      }
    });
    if (changed) setExpandedCategories(newExpanded);
  }, [editor.groupedItems, editor.categories]);

  // --- UI Handlers ---

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  }, []);

  const handleAddRow = useCallback(
    (categoryId: string) => {
      const newItem = editor.addRow(categoryId);
      if (newItem) {
        setExpandedCategories((prev) => ({ ...prev, [categoryId]: true }));
        setEditingCell({ id: newItem.id, field: "name" });
      }
    },
    [editor.addRow],
  );

  const handleDeleteCategory = useCallback(
    (categoryId: string) => {
      if (editor.isLocked) return;
      setCategoryToDelete(categoryId);
    },
    [editor.isLocked],
  );

  const handleConfirmDeleteCategory = useCallback(() => {
    if (categoryToDelete) {
      editor.deleteCategoryItems(categoryToDelete);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, editor.deleteCategoryItems]);

  const handleCellClick = useCallback(
    (id: string, field: keyof BudgetItem) => {
      if (editor.isLocked) return;
      setEditingCell({ id, field });
    },
    [editor.isLocked],
  );

  const handleCellBlur = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleBudgetChange = useCallback(
    (updates: Partial<Budget>) => {
      if (editor.isLocked) return;

      if (updates.status === "Aprovado") {
        const { missingFields, inconsistentItems } = editor.runValidation();
        if (missingFields.length > 0) {
          toast.error(`Preencha os campos obrigatórios antes de aprovar: ${missingFields.join(", ")}`);
          return;
        }
        if (inconsistentItems.length > 0) {
          toast.error(`Corrija ${inconsistentItems.length} item(ns) sem tipo de faturamento antes de aprovar`);
          return;
        }
        setApprovalError(null);
        setShowApprovalModal(true);
        return;
      }

      editor.updateBudgetFields(updates);
    },
    [editor.isLocked, editor.runValidation, editor.updateBudgetFields],
  );

  const toggleSummarySidebar = useCallback(() => {
    setActiveSidebar((current) => (current === "summary" ? null : "summary"));
  }, []);

  const toggleProfitabilitySidebar = useCallback(() => {
    setActiveSidebar((current) => (current === "profitability" ? null : "profitability"));
  }, []);

  const spreadsheetProps = useMemo(
    () => ({
      primaryCategories: editor.primaryBudgetCategories,
      internalServiceCategories: editor.internalServiceCategories,
      groupedItems: editor.groupedItems,
      expandedCategories,
      missingCategories: editor.missingCategories,
      editingCell,
      profitabilityCategoryMap: editor.profitabilityCategoryMap,
      isLocked: editor.isLocked,
      onToggleCategory: toggleCategory,
      onAddRow: handleAddRow,
      onDeleteCategory: handleDeleteCategory,
      onDeleteRow: editor.deleteRow,
      onCellClick: handleCellClick,
      onCellBlur: handleCellBlur,
      onUpdate: editor.updateItem,
    }),
    [
      editor.primaryBudgetCategories,
      editor.internalServiceCategories,
      editor.groupedItems,
      expandedCategories,
      editor.missingCategories,
      editingCell,
      editor.profitabilityCategoryMap,
      editor.isLocked,
      toggleCategory,
      handleAddRow,
      handleDeleteCategory,
      editor.deleteRow,
      handleCellClick,
      handleCellBlur,
      editor.updateItem,
    ],
  );

  const sidebarsProps = useMemo(
    () => ({
      activeSidebar,
      taxNf: editor.budget?.taxNf ?? 0,
      grandTotal: editor.budgetGrandTotal,
      billingSummary: editor.billingSummary,
      paymentTotals: editor.paymentScheduleSummary.totals,
      internalServicesSummary: editor.internalServicesSummary,
      honorariumBase: editor.billingSummary.honorariumBase,
      honorariumPercentage: editor.honorariumPercentage,
      advancePayment: editor.paymentScheduleSummary.totals.paymentAdvance,
      profitabilitySummary: editor.profitabilitySummary,
      onHonorariumPercentageChange: editor.updateHonorariumPercentage,
    }),
    [
      activeSidebar,
      editor.budget,
      editor.budgetGrandTotal,
      editor.billingSummary,
      editor.paymentScheduleSummary.totals,
      editor.internalServicesSummary,
      editor.honorariumPercentage,
      editor.profitabilitySummary,
      editor.updateHonorariumPercentage,
    ],
  );

  const handleApproveConfirm = useCallback(async () => {
    try {
      await editor.handleApprove();
      setShowApprovalModal(false);
      setApprovalError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao aprovar orçamento.";
      setApprovalError(message);
    }
  }, [editor.handleApprove]);

  const handleExportExcel = useCallback(
    async (variant: ExcelExportVariant) => {
      if (!editor.budget) return;
      try {
        await exportBudgetToExcel(editor.budget, variant);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro ao exportar para Excel.";
        toast.error(message);
      }
    },
    [editor.budget],
  );

  if (editor.isLoading || !editor.budget) {
    return <PageLoader className="bg-background" />;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <BudgetEditorHeader
        budget={editor.budget}
        activeSidebar={activeSidebar}
        isLocked={editor.isLocked}
        onBudgetChange={handleBudgetChange}
        onToggleSidebar={toggleSummarySidebar}
        onToggleProfitability={toggleProfitabilitySidebar}
        onSave={(headerUpdates) => void editor.saveBudget(headerUpdates)}
        onNavigateBack={() => navigate("/")}
        onExportExcel={handleExportExcel}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <BudgetEditorSpreadsheetArea {...spreadsheetProps} />
        <BudgetEditorSidebars {...sidebarsProps} />
      </div>

      {categoryToDelete && (
        <DeleteCategoryModal onConfirm={handleConfirmDeleteCategory} onCancel={() => setCategoryToDelete(null)} />
      )}

      {showApprovalModal && editor.budget && (
        <ApprovalConfirmModal
          budget={editor.budget}
          error={approvalError}
          onConfirm={handleApproveConfirm}
          onCancel={() => {
            setShowApprovalModal(false);
            setApprovalError(null);
          }}
        />
      )}
    </div>
  );
}
