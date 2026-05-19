import { BudgetCategory, BudgetItem, TBudgetItemUpdater } from "@/src/types";
import { ProfitabilitySummary } from "@/src/hooks/useProfitabilitySummary";
import { ChevronDown } from "lucide-react";
import React, { useMemo } from "react";
import { BudgetCategorySection } from "./BudgetCategorySection";

const noop = () => {};

interface BudgetSpreadsheetProps {
  primaryCategories: BudgetCategory[];
  internalServiceCategories: BudgetCategory[];
  groupedItems: Record<string, BudgetItem[]>;
  expandedCategories: Record<string, boolean>;
  missingCategories: BudgetCategory[];
  editingCell: { id: string; field: keyof BudgetItem } | null;
  profitabilitySummary: ProfitabilitySummary;
  isLocked?: boolean;
  onToggleCategory: (categoryId: string) => void;
  onAddRow: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteRow: (id: string) => void;
  onCellClick: (id: string, field: keyof BudgetItem) => void;
  onCellBlur: () => void;
  onUpdate: TBudgetItemUpdater;
}

export const BudgetSpreadsheet = React.memo(function BudgetSpreadsheet({
  primaryCategories,
  internalServiceCategories,
  groupedItems,
  expandedCategories,
  missingCategories,
  editingCell,
  profitabilitySummary,
  isLocked = false,
  onToggleCategory,
  onAddRow,
  onDeleteCategory,
  onDeleteRow,
  onCellClick,
  onCellBlur,
  onUpdate,
}: BudgetSpreadsheetProps) {
  const sectionProps = useMemo(() => ({
    editingCell: isLocked ? null : editingCell,
    isLocked,
    onToggle: onToggleCategory,
    onAddRow: isLocked ? noop : onAddRow,
    onDeleteCategory: isLocked ? noop : onDeleteCategory,
    onDeleteRow: isLocked ? noop : onDeleteRow,
    onCellClick: isLocked ? noop : onCellClick,
    onCellBlur,
    onUpdate: isLocked ? noop : onUpdate,
  }), [isLocked, editingCell, onToggleCategory, onAddRow, onDeleteCategory, onDeleteRow, onCellClick, onCellBlur, onUpdate]);

  const primaryCategoryProfMap = useMemo(() => {
    const map = new Map(profitabilitySummary?.categories.map((c) => [c.categoryId, c]));
    return map;
  }, [profitabilitySummary?.categories]);

  return (
    <div className="flex-1 min-h-0 p-6 overflow-y-auto">
      {/* Primary Budget Table */}
      <div className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-x-auto relative">
        <table className="w-full text-sm text-left border-collapse min-w-[2300px]">
          <thead className="text-xs uppercase bg-slate-100 text-slate-600 sticky top-0 z-20 shadow-sm shadow-slate-200 divide-x divide-slate-200">
            <tr className="border-b border-slate-200">
              <th rowSpan={2} className="px-3 py-3 w-[80px] bg-slate-100 font-semibold">
                Item
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[200px] min-w-[200px] bg-slate-100 font-semibold">
                Nome do Item
              </th>
              <th rowSpan={2} className="px-3 py-3 min-w-[300px] font-semibold">
                Descritivo
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[150px] min-w-[150px] font-semibold">
                Tipo Faturamento
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[70px] text-right font-semibold text-gray-900 bg-gray-100">
                Qtd
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[70px] text-right font-semibold text-gray-900 bg-gray-100">
                Diárias
              </th>
              <th rowSpan={2} className="px-3 py-3 min-w-[120px] text-right font-semibold text-gray-900 bg-gray-100">
                Unitário
              </th>
              <th rowSpan={2} className="px-3 py-3 min-w-[120px] text-right font-bold text-gray-900 bg-gray-200">
                Valor Total
              </th>
              <th colSpan={6} className="px-3 py-2 text-center border-b border-slate-200 font-semibold bg-gray-100 text-gray-800">
                Cronograma de Pagamento
              </th>
              <th colSpan={8} className="px-3 py-2 text-center border-b border-slate-200 font-semibold bg-gray-200 text-gray-900">
                Rentabilidade
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[50px] text-center font-semibold bg-slate-100">
                Excluir
              </th>
            </tr>
            <tr className="border-b border-slate-200 divide-x divide-slate-200">
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">Antecipado</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">30 dias</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">45 dias</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">60 dias</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">90 dias</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">120 dias</th>
              <th className="px-3 py-2 min-w-[150px] text-center text-gray-800 bg-gray-100">Fornecedor</th>
              <th className="px-3 py-2 min-w-[120px] text-center text-gray-800 bg-gray-100">Valor Fornecedor</th>
              <th className="px-3 py-2 min-w-[80px] text-center text-gray-800 bg-gray-100">% BV</th>
              <th className="px-3 py-2 min-w-[80px] text-center text-gray-800 bg-gray-100">% NF BV</th>
              <th className="px-3 py-2 min-w-[100px] text-center text-gray-800 bg-gray-100">R$ BV</th>
              <th className="px-3 py-2 min-w-[80px] text-center text-gray-800 bg-gray-100">% NF Over</th>
              <th className="px-3 py-2 min-w-[100px] text-center text-gray-800 bg-gray-100">Over</th>
              <th className="px-3 py-2 min-w-[120px] text-center text-gray-800 bg-gray-100">Valor Real</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {primaryCategories.map((category) => {
              const items = groupedItems[category.id] || [];
              if (items.length === 0) return null;
              return (
                <BudgetCategorySection
                  key={category.id}
                  category={category}
                  items={items}
                  isExpanded={expandedCategories[category.id] ?? true}
                  allowInternalStyle
                  categoryProfitability={primaryCategoryProfMap.get(category.id)}
                  {...sectionProps}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Internal Services Table */}
      <div className="mt-6 shrink-0 border border-slate-200 rounded-xl shadow-sm bg-white overflow-auto relative">
        <table className="w-full text-sm text-left border-collapse min-w-[2300px]">
          <thead className="text-xs uppercase bg-slate-100 text-slate-600 sticky top-0 z-20 shadow-sm shadow-slate-200 divide-x divide-slate-200">
            <tr className="border-b border-slate-200">
              <th rowSpan={2} className="px-3 py-3 w-[80px] bg-slate-100 font-semibold">
                Item
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[200px] min-w-[200px] bg-slate-100 font-semibold">
                Nome do Item
              </th>
              <th rowSpan={2} className="px-3 py-3 min-w-[300px] font-semibold">
                Descritivo
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[150px] min-w-[150px] font-semibold">
                Tipo Faturamento
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[70px] text-right font-semibold text-gray-900 bg-gray-100">
                Qtd
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[70px] text-right font-semibold text-gray-900 bg-gray-100">
                Diárias
              </th>
              <th rowSpan={2} className="px-3 py-3 min-w-[120px] text-right font-semibold text-gray-900 bg-gray-100">
                Unitário
              </th>
              <th rowSpan={2} className="px-3 py-3 min-w-[120px] text-right font-bold text-gray-900 bg-gray-200">
                Valor Total
              </th>
              <th colSpan={6} className="px-3 py-2 text-center border-b border-slate-200 font-semibold bg-gray-100 text-gray-800">
                Cronograma de Pagamento
              </th>
              <th colSpan={8} className="px-3 py-2 text-center border-b border-slate-200 font-semibold bg-gray-200 text-gray-900">
                Rentabilidade
              </th>
              <th rowSpan={2} className="px-3 py-3 w-[50px] text-center font-semibold bg-slate-100">
                Excluir
              </th>
            </tr>
            <tr className="border-b border-slate-200 divide-x divide-slate-200">
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">Antecipado</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">30 dias</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">45 dias</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">60 dias</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">90 dias</th>
              <th className="px-3 py-2 min-w-[110px] text-right text-gray-700 bg-gray-50">120 dias</th>
              <th className="px-3 py-2 min-w-[150px] text-center text-gray-800 bg-gray-100">Fornecedor</th>
              <th className="px-3 py-2 min-w-[120px] text-center text-gray-800 bg-gray-100">Valor Fornecedor</th>
              <th className="px-3 py-2 min-w-[80px] text-center text-gray-800 bg-gray-100">% BV</th>
              <th className="px-3 py-2 min-w-[80px] text-center text-gray-800 bg-gray-100">% NF BV</th>
              <th className="px-3 py-2 min-w-[100px] text-center text-gray-800 bg-gray-100">R$ BV</th>
              <th className="px-3 py-2 min-w-[80px] text-center text-gray-800 bg-gray-100">% NF Over</th>
              <th className="px-3 py-2 min-w-[100px] text-center text-gray-800 bg-gray-100">Over</th>
              <th className="px-3 py-2 min-w-[120px] text-center text-gray-800 bg-gray-100">Valor Real</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {internalServiceCategories.map((category) => {
              const items = groupedItems[category.id] || [];
              if (items.length === 0) return null;
              return (
                <BudgetCategorySection
                  key={category.id}
                  category={category}
                  items={items}
                  isExpanded={expandedCategories[category.id] ?? true}
                  allowInternalStyle={false}
                  categoryProfitability={primaryCategoryProfMap.get(category.id)}
                  {...sectionProps}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Missing Category */}
      {!isLocked && missingCategories.length > 0 && (
        <div className="mt-8 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-xl p-8 shadow-sm">
          <div className="text-slate-500 font-medium mb-3">Deseja adicionar uma categoria ausente?</div>
          <div className="relative">
            <select
              className="appearance-none bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer shadow-sm hover:bg-white transition-colors"
              onChange={(e) => {
                if (e.target.value) {
                  onAddRow(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                + Selecionar Nova Categoria
              </option>
              {missingCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
