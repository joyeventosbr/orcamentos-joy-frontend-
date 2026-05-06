import { formatCurrencyBRL } from "@/src/lib/formatters";
import { calculatePaymentScheduleTotals, PAYMENT_SCHEDULE_COLUMNS } from "@/src/hooks/usePaymentScheduleSummary";
import { BudgetCategory, BudgetItem } from "@/src/types";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import React from "react";
import { BudgetTableCell } from "./BudgetTableCell";

interface BudgetCategorySectionProps {
  category: BudgetCategory;
  items: BudgetItem[];
  isExpanded: boolean;
  /** Permite o estilo preto para a categoria 2.1 quando usada na tabela primária */
  allowInternalStyle?: boolean;
  editingCell: { id: string; field: keyof BudgetItem } | null;
  onToggle: (categoryId: string) => void;
  onAddRow: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteRow: (id: string) => void;
  onCellClick: (id: string, field: keyof BudgetItem) => void;
  onCellBlur: () => void;
  onUpdate: (id: string, field: keyof BudgetItem, value: any) => void;
}

export function BudgetCategorySection({
  category,
  items,
  isExpanded,
  allowInternalStyle = false,
  editingCell,
  onToggle,
  onAddRow,
  onDeleteCategory,
  onDeleteRow,
  onCellClick,
  onCellBlur,
  onUpdate,
}: BudgetCategorySectionProps) {
  const isInternalServicesCategory = allowInternalStyle && category.id === "2.1";
  const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
  const paymentTotals = calculatePaymentScheduleTotals(items);

  const cellProps = { editingCell, onCellClick, onCellBlur, onUpdate };

  return (
    <React.Fragment>
      {category.sectionTitle && (
        <tr className="bg-slate-200 text-slate-950">
          <td colSpan={14} className="px-3 py-3 text-base font-black">
            {category.sectionTitle}
          </td>
        </tr>
      )}

      {/* Category Header Row */}
      <tr
        className={
          isInternalServicesCategory
            ? "select-none border-b border-black bg-black text-white"
            : "bg-brand-primary/10 text-brand-primary select-none group border-b border-brand-primary/20"
        }
      >
        <td colSpan={14} className="p-0 relative">
          <div
            className={`flex items-center px-0 py-2 cursor-pointer transition-colors w-full h-full ${isInternalServicesCategory ? "hover:bg-zinc-900" : "hover:bg-brand-primary/15"}`}
            onClick={() => onToggle(category.id)}
          >
            <div className="flex w-full items-center justify-between px-2">
              <div className="flex items-center">
                <button
                  className={`px-1 ${isInternalServicesCategory ? "text-white/70 hover:text-white" : "text-brand-primary/60 hover:text-brand-primary"}`}
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <span className="font-semibold text-[13px] ml-1 tracking-wide whitespace-nowrap">
                  {category.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center px-3 py-1 border shadow-sm rounded text-sm font-bold whitespace-nowrap ${isInternalServicesCategory ? "border-white/20 bg-white/10 text-white" : "bg-white border-brand-primary/20 text-brand-primary"}`}
                >
                  {formatCurrencyBRL(categoryTotal)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddRow(category.id);
                  }}
                  className={`p-1.5 rounded flex items-center gap-1.5 text-xs font-bold transition-colors shadow-sm whitespace-nowrap ${isInternalServicesCategory ? "border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black" : "text-brand-primary bg-white border border-brand-primary/20 hover:text-white hover:bg-brand-primary"}`}
                >
                  <Plus size={14} /> Novo Item
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category.id);
                  }}
                  title="Excluir Categoria (Remove Todos os Itens)"
                  className={`p-1.5 rounded transition-colors whitespace-nowrap shadow-sm ${isInternalServicesCategory ? "text-white/60 hover:bg-white hover:text-red-500" : "text-brand-primary/60 hover:text-red-500 hover:bg-white"}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>

      {/* Item Rows */}
      {isExpanded &&
        items.map((item, index) => (
          <tr
            key={item.id}
            className={`group hover:bg-brand-primary/5 transition-colors divide-x divide-slate-100 ${index !== items.length - 1 ? "border-b border-slate-100" : ""}`}
          >
            <td className="align-middle px-3 py-1 bg-slate-50 group-hover:bg-slate-100 text-slate-500 font-medium whitespace-nowrap">
              {item.itemNumber}
            </td>
            <td className="align-top p-0 bg-white group-hover:bg-brand-primary/5 w-[200px] min-w-[200px]">
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
            <td className="align-middle px-3 py-2 text-right font-semibold text-gray-900 bg-slate-50/50 relative">
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
            <td className="align-middle text-center p-0">
              <button
                onClick={() => onDeleteRow(item.id)}
                className="w-full h-full min-h-[36px] flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Excluir Item"
              >
                <Trash2 size={15} />
              </button>
            </td>
          </tr>
        ))}

      {/* Payment Schedule Category Total Row */}
      <tr className="border-t border-emerald-100 bg-emerald-50/40 text-emerald-900">
        <td colSpan={8} className="px-3 py-2 text-right text-xs font-black uppercase tracking-wide">
          Total cronograma da categoria
        </td>
        {PAYMENT_SCHEDULE_COLUMNS.map((column) => (
          <td key={column.field} className="px-3 py-2 text-right text-xs font-black tabular-nums">
            {formatCurrencyBRL(paymentTotals[column.field])}
          </td>
        ))}
        <td className="px-3 py-2" />
      </tr>
    </React.Fragment>
  );
}
