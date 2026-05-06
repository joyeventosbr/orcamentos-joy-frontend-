import { formatCurrencyBRL } from "@/src/lib/formatters";
import { BILLING_TYPE_OPTIONS, BudgetItem } from "@/src/types";
import React from "react";

interface BudgetTableCellProps {
  item: BudgetItem;
  field: keyof BudgetItem;
  type?: "text" | "number" | "textarea";
  align?: "left" | "right";
  editingCell: { id: string; field: keyof BudgetItem } | null;
  onCellClick: (id: string, field: keyof BudgetItem) => void;
  onCellBlur: () => void;
  onUpdate: (id: string, field: keyof BudgetItem, value: any) => void;
}

const CURRENCY_FIELDS = ["unitPrice", "total", "paymentAdvance", "payment30d", "payment45d", "payment60d", "payment90d"];

export function BudgetTableCell({
  item,
  field,
  type = "text",
  align = "left",
  editingCell,
  onCellClick,
  onCellBlur,
  onUpdate,
}: BudgetTableCellProps) {
  if (field === "billingType") {
    const hasMissingBillingType = !item.billingType && item.total > 0;

    return (
      <div className="h-full w-full px-1 py-1">
        <select
          className={`h-8 w-full rounded border px-2 py-1 text-sm font-medium outline-none transition-colors focus:bg-white ${
            hasMissingBillingType
              ? "border-amber-400 bg-amber-50 text-amber-900 focus:border-amber-500"
              : "border-transparent bg-transparent text-slate-700 hover:bg-brand-primary/5 focus:border-brand-primary"
          }`}
          value={item.billingType}
          onChange={(e) => onUpdate(item.id, "billingType", e.target.value)}
          title={hasMissingBillingType ? "Selecione o Tipo Faturamento para este item." : undefined}
        >
          <option value="">{hasMissingBillingType ? "Pendente" : "Selecionar"}</option>
          {BILLING_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {hasMissingBillingType && (
          <div className="px-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">Obrigatório</div>
        )}
      </div>
    );
  }

  const isEditing = editingCell?.id === item.id && editingCell?.field === field;

  if (isEditing) {
    if (type === "textarea") {
      return (
        <div className="h-full w-full px-1 py-1">
          <textarea
            autoFocus
            className={`w-full bg-white border-2 border-brand-primary outline-none px-2 py-1 text-sm rounded shadow-sm text-${align} resize-y min-h-[60px]`}
            value={item[field] as string}
            onChange={(e) => onUpdate(item.id, field, e.target.value)}
            onBlur={onCellBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onCellBlur();
              }
            }}
          />
        </div>
      );
    }

    return (
      <div className="h-full w-full px-1 py-1">
        <input
          autoFocus
          type={type}
          className={`w-full h-8 bg-white border-2 border-brand-primary outline-none px-2 py-1 text-sm rounded shadow-sm text-${align}`}
          value={item[field] as string | number}
          onChange={(e) => {
            const val = type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
            onUpdate(item.id, field, val);
          }}
          onBlur={onCellBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCellBlur();
          }}
        />
      </div>
    );
  }

  let displayValue: React.ReactNode = item[field] as string | number;

  if (CURRENCY_FIELDS.includes(field as string)) {
    displayValue = formatCurrencyBRL(item[field] as number);
  }

  return (
    <div
      className={`w-full h-full min-h-[36px] px-3 py-2 cursor-text hover:bg-brand-primary/10 transition-colors flex items-center ${align === "right" ? "justify-end" : ""}`}
      onClick={() => onCellClick(item.id, field)}
    >
      <span className={`whitespace-pre-wrap break-words ${!displayValue ? "text-gray-300 italic text-xs" : ""}`}>
        {displayValue || "Vazio"}
      </span>
    </div>
  );
}
