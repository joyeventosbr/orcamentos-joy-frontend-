import { PageLoader } from "@/src/components/ui/PageLoader/PageLoader";
import { ExcelExportVariant, exportBudgetToExcel } from "@/src/lib/budgetExcelExport";
import { getNextTabCell } from "@/src/lib/budgetSpreadsheetNavigation";
import { buildDashboardReturnState, DashboardReturnState } from "@/src/lib/dashboardNavigation";
import { useBudgetEditor } from "@/src/hooks/useBudgetEditor";
import { useBudgetLeaveGuard } from "@/src/hooks/useBudgetLeaveGuard";
import { Budget, BudgetItem } from "@/src/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { BudgetEditorSidebars } from "./BudgetEditorSidebars";
import { BudgetEditorSpreadsheetArea } from "./BudgetEditorSpreadsheetArea";
import { ApprovalConfirmModal } from "./components/ApprovalConfirmModal";
import { BudgetEditorHeader, BudgetEditorHeaderHandle } from "./components/BudgetEditorHeader";
import { DeleteCategoryModal } from "./components/DeleteCategoryModal";
import { LeaveConfirmModal } from "./components/LeaveConfirmModal";

export function BudgetEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { budgetId } = useParams<{ budgetId: string }>();
  const headerRef = useRef<BudgetEditorHeaderHandle>(null);

  const editor = useBudgetEditor(budgetId);

  const navigateBackToFolder = useCallback(() => {
    const returnStateFromHistory = location.state as DashboardReturnState | null;
    if (returnStateFromHistory?.customerId && returnStateFromHistory?.folderId) {
      navigate("/", { state: returnStateFromHistory });
      return;
    }

    if (editor.budgetDetail) {
      navigate("/", {
        state: buildDashboardReturnState({
          customerId: editor.budgetDetail.customerId,
          folderId: editor.budgetDetail.folderId,
          status: editor.budgetDetail.status,
        }),
      });
      return;
    }

    navigate("/");
  }, [location.state, navigate, editor.budgetDetail]);

  // --- UI-only State ---
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof BudgetItem } | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<"summary" | "profitability" | null>("summary");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [hasPendingHeaderChanges, setHasPendingHeaderChanges] = useState(false);

  const hasUnsavedChanges = editor.isDirty || hasPendingHeaderChanges;
  const shouldBlockLeave = hasUnsavedChanges && !editor.isLocked;

  const handleSaveForLeave = useCallback(async () => {
    const pendingHeader = headerRef.current?.getPendingUpdates() ?? {};
    return editor.saveBudget(Object.keys(pendingHeader).length > 0 ? pendingHeader : undefined);
  }, [editor.saveBudget]);

  const leaveGuard = useBudgetLeaveGuard({
    shouldBlock: shouldBlockLeave,
    onSave: handleSaveForLeave,
    leaveDestination: navigateBackToFolder,
  });
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

  const handleCellTab = useCallback(
    (id: string, field: keyof BudgetItem) => {
      if (editor.isLocked) return;
      const next = getNextTabCell(editor.budgetItems, id, field);
      setEditingCell(next);
    },
    [editor.isLocked, editor.budgetItems],
  );

  const handleBudgetChange = useCallback(
    (updates: Partial<Budget>) => {
      if (editor.isLocked) return;
      editor.updateBudgetFields(updates);
    },
    [editor.isLocked, editor.updateBudgetFields],
  );

  const handleOpenApprovalModal = useCallback(() => {
    const { missingFields, inconsistentItems, itemsMissingQtyOrDays } = editor.runValidation();
    if (missingFields.length > 0) {
      toast.error(`Preencha os campos obrigatórios antes de aprovar: ${missingFields.join(", ")}`);
      return;
    }
    if (itemsMissingQtyOrDays.length > 0) {
      toast.error(`Corrija ${itemsMissingQtyOrDays.length} item(ns) com Qtd ou Diárias não preenchidos antes de aprovar`);
      return;
    }
    if (inconsistentItems.length > 0) {
      toast.error(`Corrija ${inconsistentItems.length} item(ns) sem tipo de faturamento antes de aprovar`);
      return;
    }
    setApprovalError(null);
    setShowApprovalModal(true);
  }, [editor.runValidation]);

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
      isBillingTypeLocked: editor.isBillingTypeLocked,
      onToggleCategory: toggleCategory,
      onAddRow: handleAddRow,
      onDeleteCategory: handleDeleteCategory,
      onDeleteRow: editor.deleteRow,
      onCellClick: handleCellClick,
      onCellBlur: handleCellBlur,
      onCellTab: handleCellTab,
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
      editor.isBillingTypeLocked,
      toggleCategory,
      handleAddRow,
      handleDeleteCategory,
      editor.deleteRow,
      handleCellClick,
      handleCellBlur,
      handleCellTab,
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
        ref={headerRef}
        budget={editor.budget}
        activeSidebar={activeSidebar}
        isLocked={editor.isLocked}
        isSaving={editor.isSaving}
        onBudgetChange={handleBudgetChange}
        onToggleSidebar={toggleSummarySidebar}
        onToggleProfitability={toggleProfitabilitySidebar}
        onSave={(headerUpdates) => void editor.saveBudget(headerUpdates)}
        onNavigateBack={() => leaveGuard.requestLeave(navigateBackToFolder)}
        onExportExcel={handleExportExcel}
        onApprove={handleOpenApprovalModal}
        onPendingHeaderChange={setHasPendingHeaderChanges}
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

      {leaveGuard.showLeaveModal && (
        <LeaveConfirmModal
          isSaving={editor.isSaving}
          onSaveAndLeave={() => void leaveGuard.handleSaveAndLeave()}
          onLeaveWithoutSaving={leaveGuard.handleLeaveWithoutSaving}
          onCancel={leaveGuard.closeLeaveModal}
        />
      )}
    </div>
  );
}
