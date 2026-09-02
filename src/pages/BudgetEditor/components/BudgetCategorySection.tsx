import { formatCurrencyBRL } from "@/src/lib/formatters";
import { mapBudgetItemToProfitabilityMetrics } from "@/src/lib/profitability";
import { calculatePaymentScheduleTotals, PAYMENT_SCHEDULE_COLUMNS } from "@/src/hooks/usePaymentScheduleSummary";
import { ProfitabilityCategory } from "@/src/hooks/useProfitabilitySummary";
import { BudgetCategory, BudgetItem, TBudgetItemUpdater } from "@/src/types";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import React, { memo } from "react";
import { BudgetTableCell } from "./BudgetTableCell";

type BudgetItemRowCellProps = {
  editingCell: { id: string; field: keyof BudgetItem } | null;
  onCellClick: (id: string, field: keyof BudgetItem) => void;
  onCellBlur: () => void;
  onCellTab: (id: string, field: keyof BudgetItem) => void;
  onCellShiftTab: (id: string, field: keyof BudgetItem) => void;
  onCellEnter: (id: string, field: keyof BudgetItem) => void;
  onUpdate: TBudgetItemUpdater;
  isBillingTypeLocked: boolean;
  isLocked: boolean;
};

interface BudgetItemRowProps extends BudgetItemRowCellProps {
  item: BudgetItem;
  isLast: boolean;
  onDeleteRow: (id: string) => void;
}

const BudgetItemRow = memo(
  function BudgetItemRow({
    item,
    isLast,
    isLocked,
    isBillingTypeLocked,
    editingCell,
    onCellClick,
    onCellBlur,
    onCellTab,
    onCellShiftTab,
    onCellEnter,
    onUpdate,
    onDeleteRow,
  }: BudgetItemRowProps) {
    const profitabilityMetrics = mapBudgetItemToProfitabilityMetrics(item);
    const cellProps = {
      editingCell,
      onCellClick,
      onCellBlur,
      onCellTab,
      onCellShiftTab,
      onCellEnter,
      onUpdate,
      isBillingTypeLocked,
      isLocked,
    };

    return (
      <tr
        className={`group hover:bg-gray-50 transition-colors divide-x divide-slate-100 ${!isLast ? "border-b border-slate-100" : ""}`}
      >
        <td className="sticky left-0 z-10 align-middle px-3 py-1 w-[80px] min-w-[80px] max-w-[80px] bg-slate-50 group-hover:bg-slate-100 text-slate-500 font-medium whitespace-nowrap">
          {item.itemNumber}
        </td>
        <td className="sticky left-[80px] z-10 align-top p-0 bg-white group-hover:bg-gray-50 w-[200px] min-w-[200px] shadow-[2px_0_0_0_rgb(226_232_240)]">
          <BudgetTableCell {...cellProps} item={item} field="name" type="text" />
        </td>
        <td className="align-top p-0 min-w-[300px]">
          <BudgetTableCell {...cellProps} item={item} field="description" type="textarea" />
        </td>
        <td className="align-top p-0 w-[150px] min-w-[150px]">
          <BudgetTableCell {...cellProps} item={item} field="billingType" type="text" />
        </td>
        <td className="align-top p-0">
          <BudgetTableCell {...cellProps} item={item} field="quantity" type="number" align="right" />
        </td>
        <td className="align-top p-0">
          <BudgetTableCell {...cellProps} item={item} field="days" type="number" align="right" />
        </td>
        <td className="align-top p-0">
          <BudgetTableCell {...cellProps} item={item} field="unitPrice" type="number" align="right" />
        </td>
        <td className="align-middle px-3 py-2 text-right font-semibold text-gray-900 bg-white relative">
          {formatCurrencyBRL(item.total)}
        </td>
        <td className="align-top p-0">
          <BudgetTableCell {...cellProps} item={item} field="paymentAdvance" type="number" align="right" />
        </td>
        <td className="align-top p-0">
          <BudgetTableCell {...cellProps} item={item} field="payment30d" type="number" align="right" />
        </td>
        <td className="align-top p-0">
          <BudgetTableCell {...cellProps} item={item} field="payment45d" type="number" align="right" />
        </td>
        <td className="align-top p-0">
          <BudgetTableCell {...cellProps} item={item} field="payment60d" type="number" align="right" />
        </td>
        <td className="align-top p-0">
          <BudgetTableCell {...cellProps} item={item} field="payment90d" type="number" align="right" />
        </td>
        <td className="align-top p-0">
          <BudgetTableCell {...cellProps} item={item} field="payment120d" type="number" align="right" />
        </td>
        <td className="align-top p-0 border-l-2 border-gray-200 bg-white">
          <BudgetTableCell {...cellProps} item={item} field="fornecedorName" type="text" />
        </td>
        <td className="align-top p-0 bg-white">
          <BudgetTableCell {...cellProps} item={item} field="fornecedorValue" type="number" align="right" />
        </td>
        <td className="align-top p-0 bg-white">
          <BudgetTableCell {...cellProps} item={item} field="percentBV" type="number" align="right" />
        </td>
        <td className="align-top p-0 bg-white">
          <BudgetTableCell {...cellProps} item={item} field="percentNfBV" type="number" align="right" />
        </td>
        <td className="align-middle px-3 py-2 text-right text-slate-600 bg-white">
          {formatCurrencyBRL(profitabilityMetrics.rsBV)}
        </td>
        <td className="align-top p-0 bg-white">
          <BudgetTableCell {...cellProps} item={item} field="percentNfOver" type="number" align="right" />
        </td>
        <td className="align-middle px-3 py-2 text-right text-slate-600 bg-white">
          {formatCurrencyBRL(profitabilityMetrics.over)}
        </td>
        <td className="align-middle px-3 py-2 text-right font-semibold text-slate-900 bg-white">
          {formatCurrencyBRL(profitabilityMetrics.valorReal)}
        </td>
        <td className="align-middle p-0 bg-white">
          <BudgetTableCell {...cellProps} item={item} field="nfReceived" />
        </td>
        <td className="align-middle text-center p-0 border-l-2 border-slate-100">
          {!isLocked && (
            <button
              onClick={() => onDeleteRow(item.id)}
              className="w-full h-full min-h-[36px] flex items-center justify-center text-slate-300 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Excluir Item"
            >
              <Trash2 size={15} />
            </button>
          )}
        </td>
      </tr>
    );
  },
  (prev, next) => {
    if (prev.item !== next.item) return false;
    if (prev.isLast !== next.isLast) return false;
    if (prev.isLocked !== next.isLocked) return false;
    if (prev.isBillingTypeLocked !== next.isBillingTypeLocked) return false;
    if (prev.onDeleteRow !== next.onDeleteRow) return false;
    if (prev.onUpdate !== next.onUpdate) return false;
    if (prev.onCellClick !== next.onCellClick) return false;
    if (prev.onCellBlur !== next.onCellBlur) return false;
    if (prev.onCellTab !== next.onCellTab) return false;
    if (prev.onCellShiftTab !== next.onCellShiftTab) return false;
    if (prev.onCellEnter !== next.onCellEnter) return false;

    const prevRowEditing = prev.editingCell?.id === prev.item.id;
    const nextRowEditing = next.editingCell?.id === next.item.id;
    if (prevRowEditing || nextRowEditing) {
      return prev.editingCell === next.editingCell;
    }

    return true;
  },
);

interface BudgetCategorySectionProps {
  key?: React.Key;
  category: BudgetCategory;
  items: BudgetItem[];
  isExpanded: boolean;
  allowInternalStyle?: boolean;
  isLocked?: boolean;
  isBillingTypeLocked?: boolean;
  categoryProfitability?: ProfitabilityCategory;
  editingCell: { id: string; field: keyof BudgetItem } | null;
  onToggle: (categoryId: string) => void;
  onAddRow: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteRow: (id: string) => void;
  onCellClick: (id: string, field: keyof BudgetItem) => void;
  onCellBlur: () => void;
  onCellTab: (id: string, field: keyof BudgetItem) => void;
  onCellShiftTab: (id: string, field: keyof BudgetItem) => void;
  onCellEnter: (id: string, field: keyof BudgetItem) => void;
  onUpdate: TBudgetItemUpdater;
}

export const BudgetCategorySection = memo(function BudgetCategorySection({
  category,
  items,
  isExpanded,
  allowInternalStyle = false,
  isLocked = false,
  isBillingTypeLocked = false,
  categoryProfitability,
  editingCell,
  onToggle,
  onAddRow,
  onDeleteCategory,
  onDeleteRow,
  onCellClick,
  onCellBlur,
  onCellTab,
  onCellShiftTab,
  onCellEnter,
  onUpdate,
}: BudgetCategorySectionProps) {
  const isInternalServicesCategory = allowInternalStyle && category.id === "2.1";
  const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
  const paymentTotals = calculatePaymentScheduleTotals(items);

  return (
    <React.Fragment>
      {/* Category Header Row */}
      <tr
        className={
          isInternalServicesCategory
            ? "select-none border-b border-black bg-black text-white"
            : "bg-gray-100 text-gray-900 select-none group border-b border-gray-200"
        }
      >
        <td colSpan={24} className="p-0 relative">
          <div
            className="flex w-full h-full cursor-pointer items-center px-0 py-2"
            onClick={() => onToggle(category.id)}
          >
            <div className="flex w-full items-center justify-between">
              <div
                className={`sticky left-0 z-10 flex w-[400px] min-w-[400px] self-stretch items-center px-2 pr-4 shadow-[2px_0_0_0_rgb(203_213_225)] ${isInternalServicesCategory ? "bg-black" : "bg-gray-100"}`}
              >
                <button
                  className={`px-1 ${isInternalServicesCategory ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className="ml-2 min-w-0 py-0.5">
                  <span className="block whitespace-nowrap font-semibold text-[15px] leading-5 tracking-wide">
                    {category.name}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs font-medium whitespace-nowrap ${isInternalServicesCategory ? "text-white/70" : "text-gray-500"}`}
                  >
                    Total: <span className={isInternalServicesCategory ? "text-white" : "text-gray-800"}>{formatCurrencyBRL(categoryTotal)}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2">
                {!isLocked && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddRow(category.id);
                      }}
                      className={`p-1.5 rounded flex items-center gap-1.5 text-xs font-bold transition-colors shadow-sm whitespace-nowrap ${isInternalServicesCategory ? "border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black" : "text-gray-700 bg-white border border-gray-200 hover:text-gray-900 hover:bg-gray-50"}`}
                    >
                      <Plus size={14} /> Novo Item
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(category.id);
                      }}
                      title="Excluir Categoria (Remove Todos os Itens)"
                      className={`p-1.5 rounded transition-colors whitespace-nowrap shadow-sm ${isInternalServicesCategory ? "text-white/60 hover:bg-white hover:text-gray-900" : "text-gray-400 hover:text-gray-900 hover:bg-white"}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </td>
      </tr>

      {/* Item Rows */}
      {isExpanded &&
        items.map((item, index) => (
          <BudgetItemRow
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
            isLocked={isLocked}
            isBillingTypeLocked={isBillingTypeLocked}
            editingCell={editingCell}
            onCellClick={onCellClick}
            onCellBlur={onCellBlur}
            onCellTab={onCellTab}
            onCellShiftTab={onCellShiftTab}
            onCellEnter={onCellEnter}
            onUpdate={onUpdate}
            onDeleteRow={onDeleteRow}
          />
        ))}

      {/* Payment Schedule Category Total Row */}
      <tr className="border-t border-gray-200 bg-gray-100 text-gray-900">
        <td colSpan={8} className="px-3 py-2 text-right text-xs font-black uppercase tracking-wide">
          Total Fluxo de pagamento do Item
        </td>
        {PAYMENT_SCHEDULE_COLUMNS.map((column) => (
          <td key={column.field} className="px-3 py-2 text-right text-xs font-black tabular-nums">
            {formatCurrencyBRL(paymentTotals[column.field])}
          </td>
        ))}
        {/* Rentabilidade Totals */}
        <td className="px-3 py-2 border-l-2 border-gray-200 bg-gray-200" />
        <td className="px-3 py-2 text-right text-xs font-black tabular-nums text-gray-900 bg-gray-200">
          {categoryProfitability ? formatCurrencyBRL(categoryProfitability.totals.valorFornecedor) : "-"}
        </td>
        <td className="px-3 py-2 bg-gray-200" colSpan={2} />
        <td className="px-3 py-2 text-right text-xs font-black tabular-nums text-gray-900 bg-gray-200">
          {categoryProfitability ? formatCurrencyBRL(categoryProfitability.totals.rsBV) : "-"}
        </td>
        <td className="px-3 py-2 bg-gray-200" />
        <td className="px-3 py-2 text-right text-xs font-black tabular-nums text-gray-900 bg-gray-200">
          {categoryProfitability ? formatCurrencyBRL(categoryProfitability.totals.over) : "-"}
        </td>
        <td className="px-3 py-2 text-right text-xs font-black tabular-nums text-gray-900 bg-gray-300">
          {categoryProfitability ? formatCurrencyBRL(categoryProfitability.totals.valorReal) : "-"}
        </td>
        <td className="px-3 py-2 bg-gray-200" />
        <td className="px-3 py-2 border-l-2 border-slate-100" />
      </tr>
    </React.Fragment>
  );
}, (prev, next) => {
  if (prev.category !== next.category) return false;
  if (prev.items !== next.items) return false;
  if (prev.isExpanded !== next.isExpanded) return false;
  if (prev.allowInternalStyle !== next.allowInternalStyle) return false;
  if (prev.isLocked !== next.isLocked) return false;
  if (prev.isBillingTypeLocked !== next.isBillingTypeLocked) return false;
  if (prev.categoryProfitability !== next.categoryProfitability) return false;
  if (prev.onToggle !== next.onToggle) return false;
  if (prev.onAddRow !== next.onAddRow) return false;
  if (prev.onDeleteCategory !== next.onDeleteCategory) return false;
  if (prev.onDeleteRow !== next.onDeleteRow) return false;
  if (prev.onUpdate !== next.onUpdate) return false;
  if (prev.onCellClick !== next.onCellClick) return false;
  if (prev.onCellBlur !== next.onCellBlur) return false;
  if (prev.onCellTab !== next.onCellTab) return false;
  if (prev.onCellShiftTab !== next.onCellShiftTab) return false;
  if (prev.onCellEnter !== next.onCellEnter) return false;

  const prevHasEditing = prev.items.some((item) => item.id === prev.editingCell?.id);
  const nextHasEditing = next.items.some((item) => item.id === next.editingCell?.id);
  if (prevHasEditing || nextHasEditing) {
    return prev.editingCell === next.editingCell;
  }

  return true;
});
