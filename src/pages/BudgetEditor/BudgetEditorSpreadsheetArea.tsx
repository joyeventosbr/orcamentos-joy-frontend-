import { BudgetSpreadsheet } from "@/src/pages/BudgetEditor/components/BudgetSpreadsheet";
import { ProfitabilityCategory } from "@/src/hooks/useProfitabilitySummary";
import { BudgetCategory, BudgetItem, TBudgetItemUpdater } from "@/src/types";
import { memo } from "react";

export type BudgetEditorSpreadsheetAreaProps = {
  primaryCategories: BudgetCategory[];
  internalServiceCategories: BudgetCategory[];
  groupedItems: Record<string, BudgetItem[]>;
  expandedCategories: Record<string, boolean>;
  missingCategories: BudgetCategory[];
  editingCell: { id: string; field: keyof BudgetItem } | null;
  profitabilityCategoryMap: Map<string, ProfitabilityCategory>;
  isLocked: boolean;
  isBillingTypeLocked: boolean;
  onToggleCategory: (categoryId: string) => void;
  onAddRow: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteRow: (id: string) => void;
  onCellClick: (id: string, field: keyof BudgetItem) => void;
  onCellBlur: () => void;
  onCellTab: (id: string, field: keyof BudgetItem) => void;
  onUpdate: TBudgetItemUpdater;
};

export const BudgetEditorSpreadsheetArea = memo(function BudgetEditorSpreadsheetArea(
  props: BudgetEditorSpreadsheetAreaProps,
) {
  return (
    <div className="flex-1 flex flex-col bg-muted/50 min-w-0 min-h-0">
      <BudgetSpreadsheet {...props} />
    </div>
  );
});
