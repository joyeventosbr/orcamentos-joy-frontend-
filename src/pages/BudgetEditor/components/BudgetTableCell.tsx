import { formatCurrencyBRL } from "@/src/lib/formatters";
import { BILLING_TYPE_OPTIONS, BudgetItem, TBudgetItemUpdater } from "@/src/types";
import React, { memo, useEffect, useRef, useState } from "react";

function numberToDraft(value: number): string {
  if (value === 0) return "";
  return String(value);
}

function parseDraftNumber(raw: string): number {
  const normalized = raw.trim().replace(",", ".");
  if (normalized === "" || normalized === "-" || normalized === ".") return 0;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

const DRAFT_NUMBER_PATTERN = /^-?\d*[.,]?\d*$/;

function EditableTextInput({
  value,
  align,
  onCommit,
  onBlur,
}: {
  value: string;
  align: "left" | "right";
  onCommit: (value: string) => void;
  onBlur: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const commit = () => {
    if (draft !== value) onCommit(draft);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      className={`w-full h-8 bg-white border-2 border-gray-300 outline-none px-2 py-1 text-sm rounded shadow-sm text-${align}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        commit();
        onBlur();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit();
          onBlur();
        }
      }}
    />
  );
}

function EditableTextarea({
  value,
  align,
  onCommit,
  onBlur,
}: {
  value: string;
  align: "left" | "right";
  onCommit: (value: string) => void;
  onBlur: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const commit = () => {
    if (draft !== value) onCommit(draft);
  };

  return (
    <textarea
      ref={textareaRef}
      className={`w-full bg-white border-2 border-gray-300 outline-none px-2 py-1 text-sm rounded shadow-sm text-${align} resize-y min-h-[60px]`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        commit();
        onBlur();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          commit();
          onBlur();
        }
      }}
    />
  );
}

function EditableNumberInput({
  value,
  align,
  onCommit,
  onBlur,
}: {
  value: number;
  align: "left" | "right";
  onCommit: (value: number) => void;
  onBlur: () => void;
}) {
  const [draft, setDraft] = useState(() => numberToDraft(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const commit = () => {
    const parsed = parseDraftNumber(draft);
    if (parsed !== value) onCommit(parsed);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      className={`w-full h-8 bg-white border-2 border-gray-300 outline-none px-2 py-1 text-sm rounded shadow-sm text-${align}`}
      value={draft}
      onChange={(e) => {
        const next = e.target.value;
        if (next === "" || DRAFT_NUMBER_PATTERN.test(next)) {
          setDraft(next);
        }
      }}
      onBlur={() => {
        commit();
        onBlur();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit();
          onBlur();
        }
      }}
    />
  );
}

interface BudgetTableCellProps {
  item: BudgetItem;
  field: keyof BudgetItem;
  type?: "text" | "number" | "textarea";
  align?: "left" | "right";
  editingCell: { id: string; field: keyof BudgetItem } | null;
  onCellClick: (id: string, field: keyof BudgetItem) => void;
  onCellBlur: () => void;
  onUpdate: TBudgetItemUpdater;
}

const CURRENCY_FIELDS = [
  "unitPrice",
  "total",
  "paymentAdvance",
  "payment30d",
  "payment45d",
  "payment60d",
  "payment90d",
  "payment120d",
  "fornecedorValue",
];
const PERCENT_FIELDS = ["percentBV", "percentNfOver"];

function areBudgetTableCellPropsEqual(prev: BudgetTableCellProps, next: BudgetTableCellProps): boolean {
  if (prev.item !== next.item) return false;
  if (prev.field !== next.field) return false;
  if (prev.type !== next.type) return false;
  if (prev.align !== next.align) return false;
  if (prev.onUpdate !== next.onUpdate) return false;
  if (prev.onCellClick !== next.onCellClick) return false;
  if (prev.onCellBlur !== next.onCellBlur) return false;

  const prevIsEditing = prev.editingCell?.id === prev.item.id && prev.editingCell?.field === prev.field;
  const nextIsEditing = next.editingCell?.id === next.item.id && next.editingCell?.field === next.field;

  return prevIsEditing === nextIsEditing;
}

function BillingTypeSelect({
  item,
  hasMissingBillingType,
  onUpdate,
}: {
  item: BudgetItem;
  hasMissingBillingType: boolean;
  onUpdate: TBudgetItemUpdater;
}) {
  const [draft, setDraft] = useState(item.billingType);

  useEffect(() => {
    setDraft(item.billingType);
  }, [item.billingType]);

  const commit = (next: string) => {
    setDraft(next);
    if (next !== item.billingType) {
      onUpdate(item.id, "billingType", next);
    }
  };

  return (
    <div className="h-full w-full px-1 py-1">
      <select
        className={`h-8 w-full rounded border px-2 py-1 text-sm font-medium outline-none transition-all focus:bg-white ${
          hasMissingBillingType
            ? "border-red-300 bg-amber-50 text-red-900 focus:border-red-400"
            : "border-transparent bg-transparent text-slate-700 hover:bg-gray-100 focus:border-gray-300"
        }`}
        value={draft}
        onChange={(e) => commit(e.target.value)}
        title={hasMissingBillingType ? "Selecione o Tipo Faturamento — valor unitário preenchido sem tipo." : undefined}
      >
        <option value="">{hasMissingBillingType ? "⚠ Pendente" : "Selecionar"}</option>
        {BILLING_TYPE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {hasMissingBillingType && (
        <div className="px-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-red-600 text-center">
          Obrigatório
        </div>
      )}
    </div>
  );
}

export const BudgetTableCell = memo(function BudgetTableCell({
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
    const hasMissingBillingType = !item.billingType && (item.unitPrice > 0 || item.total > 0);

    return <BillingTypeSelect item={item} hasMissingBillingType={hasMissingBillingType} onUpdate={onUpdate} />;
  }

  const isEditing = editingCell?.id === item.id && editingCell?.field === field;

  if (isEditing) {
    if (type === "textarea") {
      return (
        <div className="h-full w-full px-1 py-1">
          <EditableTextarea
            value={(item[field] as string) ?? ""}
            align={align}
            onCommit={(val) => onUpdate(item.id, field, val)}
            onBlur={onCellBlur}
          />
        </div>
      );
    }

    if (type === "number") {
      return (
        <div className="h-full w-full px-1 py-1">
          <EditableNumberInput
            value={Number(item[field]) || 0}
            align={align}
            onCommit={(val) => onUpdate(item.id, field, val)}
            onBlur={onCellBlur}
          />
        </div>
      );
    }

    return (
      <div className="h-full w-full px-1 py-1">
        <EditableTextInput
          value={(item[field] as string) ?? ""}
          align={align}
          onCommit={(val) => onUpdate(item.id, field, val)}
          onBlur={onCellBlur}
        />
      </div>
    );
  }

  let displayValue: React.ReactNode = item[field] as string | number;

  if (CURRENCY_FIELDS.includes(field as string)) {
    displayValue = formatCurrencyBRL(Number(item[field]) || 0);
  } else if (PERCENT_FIELDS.includes(field as string)) {
    const val = item[field] as number;
    displayValue = `${(val || 0).toFixed(1)}%`;
  }

  return (
    <div
      className={`w-full h-full min-h-[36px] px-3 py-2 cursor-text hover:bg-gray-100 transition-colors flex items-center ${align === "right" ? "justify-end" : ""}`}
      onClick={() => onCellClick(item.id, field)}
    >
      <span className={`whitespace-pre-wrap break-words ${!displayValue ? "text-gray-300 italic text-xs" : ""}`}>
        {displayValue || "Vazio"}
      </span>
    </div>
  );
}, areBudgetTableCellPropsEqual);
