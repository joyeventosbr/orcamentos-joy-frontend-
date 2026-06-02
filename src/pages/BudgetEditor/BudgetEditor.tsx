import { useBudgetEditor } from "@/src/hooks/useBudgetEditor";
import { Budget, BudgetItem } from "@/src/types";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { BudgetEditorHeader } from "./components/BudgetEditorHeader";
import { BudgetSpreadsheet } from "./components/BudgetSpreadsheet";
import { BudgetSummaryPanel } from "./components/BudgetSummaryPanel";
import { ProfitabilitySidebar } from "./components/ProfitabilitySidebar";
import { DeleteCategoryModal } from "./components/DeleteCategoryModal";
import { ApprovalConfirmModal } from "./components/ApprovalConfirmModal";

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

  const handleAddRow = useCallback((categoryId: string) => {
    const newItem = editor.addRow(categoryId);
    if (newItem) {
      setExpandedCategories((prev) => ({ ...prev, [categoryId]: true }));
      setEditingCell({ id: newItem.id, field: "name" });
    }
  }, [editor.addRow]);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    if (editor.isLocked) return;
    setCategoryToDelete(categoryId);
  }, [editor.isLocked]);

  const handleConfirmDeleteCategory = useCallback(() => {
    if (categoryToDelete) {
      editor.deleteCategoryItems(categoryToDelete);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, editor.deleteCategoryItems]);

  const handleCellClick = useCallback((id: string, field: keyof BudgetItem) => {
    if (editor.isLocked) return;
    setEditingCell({ id, field });
  }, [editor.isLocked]);

  const handleCellBlur = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleBudgetChange = useCallback((updates: Partial<Budget>) => {
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
  }, [editor.isLocked, editor.runValidation, editor.updateBudgetFields]);

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

  if (editor.isLoading || !editor.budget) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background">
        <div className="rounded-2xl border border-border bg-card px-6 py-5 text-center shadow-sm">
          <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Carregando orçamento</div>
          <div className="mt-2 text-sm text-muted-foreground">Buscando dados da API...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <BudgetEditorHeader
        budget={editor.budget}
        activeSidebar={activeSidebar}
        isLocked={editor.isLocked}
        onBudgetChange={handleBudgetChange}
        onToggleSidebar={() => setActiveSidebar(activeSidebar === "summary" ? null : "summary")}
        onToggleProfitability={() => setActiveSidebar(activeSidebar === "profitability" ? null : "profitability")}
        onSave={editor.saveBudget}
        onNavigateBack={() => navigate("/")}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col bg-muted/50 min-w-0 min-h-0">
          <BudgetSpreadsheet
            primaryCategories={editor.primaryBudgetCategories}
            internalServiceCategories={editor.internalServiceCategories}
            groupedItems={editor.groupedItems}
            expandedCategories={expandedCategories}
            missingCategories={editor.missingCategories}
            editingCell={editingCell}
            profitabilitySummary={editor.profitabilitySummary}
            isLocked={editor.isLocked}
            onToggleCategory={toggleCategory}
            onAddRow={handleAddRow}
            onDeleteCategory={handleDeleteCategory}
            onDeleteRow={editor.deleteRow}
            onCellClick={handleCellClick}
            onCellBlur={handleCellBlur}
            onUpdate={editor.updateItem}
          />
        </div>

        <BudgetSummaryPanel
          isOpen={activeSidebar === "summary"}
          grandTotal={editor.budgetGrandTotal}
          billingSummary={editor.billingSummary}
          paymentTotals={editor.paymentScheduleSummary.totals}
          internalServicesSummary={editor.internalServicesSummary}
          honorariumBase={editor.billingSummary.honorariumBase}
          honorariumPercentage={editor.honorariumPercentage}
          advancePayment={editor.paymentScheduleSummary.totals.paymentAdvance}
          onHonorariumPercentageChange={editor.updateHonorariumPercentage}
        />

        <ProfitabilitySidebar
          isOpen={activeSidebar === "profitability"}
          summary={editor.profitabilitySummary}
          items={editor.primaryBudgetItems}
          onUpdateItem={editor.updateItem}
        />
      </div>

      {categoryToDelete && (
        <DeleteCategoryModal
          onConfirm={handleConfirmDeleteCategory}
          onCancel={() => setCategoryToDelete(null)}
        />
      )}

      {showApprovalModal && editor.budget && (
        <ApprovalConfirmModal
          budget={editor.budget}
          error={approvalError}
          onConfirm={handleApproveConfirm}
          onCancel={() => { setShowApprovalModal(false); setApprovalError(null); }}
        />
      )}
    </div>
  );
}
