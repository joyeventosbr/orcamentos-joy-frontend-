import { formatCurrencyBRL } from "@/src/lib/formatters";
import { BILLING_TYPE_OPTIONS, BudgetItem, isInternalServiceCategory, TBudgetItemUpdater } from "@/src/types";
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

function handleSpreadsheetKeyDown(
  event: React.KeyboardEvent,
  {
    onCommit,
    onTab,
    onShiftTab,
    onEnter,
    multiline = false,
    onInsertNewline,
  }: {
    onCommit: () => void;
    onTab: () => void;
    onShiftTab: () => void;
    onEnter: () => void;
    multiline?: boolean;
    onInsertNewline?: () => void;
  },
) {
  if (multiline && event.key === "Enter" && event.altKey) {
    event.preventDefault();
    onInsertNewline?.();
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    onCommit();
    if (event.shiftKey) {
      onShiftTab();
    } else {
      onTab();
    }
    return;
  }

  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    onCommit();
    onEnter();
  }
}

function EditableTextInput({
  value,
  align,
  onCommit,
  onBlur,
  onTab,
  onShiftTab,
  onEnter,
}: {
  value: string;
  align: "left" | "right";
  onCommit: (value: string) => void;
  onBlur: () => void;
  onTab: () => void;
  onShiftTab: () => void;
  onEnter: () => void;
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
      onKeyDown={(e) =>
        handleSpreadsheetKeyDown(e, {
          onCommit: commit,
          onTab,
          onShiftTab,
          onEnter,
        })
      }
    />
  );
}

function EditableTextarea({
  value,
  align,
  onCommit,
  onBlur,
  onTab,
  onShiftTab,
  onEnter,
}: {
  value: string;
  align: "left" | "right";
  onCommit: (value: string) => void;
  onBlur: () => void;
  onTab: () => void;
  onShiftTab: () => void;
  onEnter: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const commit = () => {
    if (draft !== value) onCommit(draft);
  };

  const insertNewlineAtCursor = () => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    const next = `${draft.slice(0, start)}\n${draft.slice(end)}`;
    setDraft(next);

    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + 1;
      el.setSelectionRange(cursor, cursor);
    });
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
      onKeyDown={(e) =>
        handleSpreadsheetKeyDown(e, {
          onCommit: commit,
          onTab,
          onShiftTab,
          onEnter,
          multiline: true,
          onInsertNewline: insertNewlineAtCursor,
        })
      }
    />
  );
}

function EditableNumberInput({
  value,
  align,
  onCommit,
  onBlur,
  onTab,
  onShiftTab,
  onEnter,
}: {
  value: number;
  align: "left" | "right";
  onCommit: (value: number) => void;
  onBlur: () => void;
  onTab: () => void;
  onShiftTab: () => void;
  onEnter: () => void;
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
      onKeyDown={(e) =>
        handleSpreadsheetKeyDown(e, {
          onCommit: commit,
          onTab,
          onShiftTab,
          onEnter,
        })
      }
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
  onCellTab: (id: string, field: keyof BudgetItem) => void;
  onCellShiftTab: (id: string, field: keyof BudgetItem) => void;
  onCellEnter: (id: string, field: keyof BudgetItem) => void;
  onUpdate: TBudgetItemUpdater;
  isBillingTypeLocked?: boolean;
  isLocked?: boolean;
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
const PERCENT_FIELDS = ["percentBV", "percentNfBV", "percentNfOver"];

function areBudgetTableCellPropsEqual(prev: BudgetTableCellProps, next: BudgetTableCellProps): boolean {
  if (prev.item !== next.item) return false;
  if (prev.field !== next.field) return false;
  if (prev.type !== next.type) return false;
  if (prev.align !== next.align) return false;
  if (prev.isBillingTypeLocked !== next.isBillingTypeLocked) return false;
  if (prev.isLocked !== next.isLocked) return false;
  if (prev.onUpdate !== next.onUpdate) return false;
  if (prev.onCellClick !== next.onCellClick) return false;
  if (prev.onCellBlur !== next.onCellBlur) return false;
  if (prev.onCellTab !== next.onCellTab) return false;
  if (prev.onCellShiftTab !== next.onCellShiftTab) return false;
  if (prev.onCellEnter !== next.onCellEnter) return false;

  const prevIsEditing = prev.editingCell?.id === prev.item.id && prev.editingCell?.field === prev.field;
  const nextIsEditing = next.editingCell?.id === next.item.id && next.editingCell?.field === next.field;

  return prevIsEditing === nextIsEditing;
}

function NfReceivedCell({
  item,
  isLocked,
  isFocused,
  onUpdate,
  onTab,
  onShiftTab,
  onEnter,
}: {
  item: BudgetItem;
  isLocked: boolean;
  isFocused: boolean;
  onUpdate: TBudgetItemUpdater;
  onTab: () => void;
  onShiftTab: () => void;
  onEnter: () => void;
}) {
  const [draft, setDraft] = useState(item.nfReceived ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(item.nfReceived ?? "");
  }, [item.nfReceived]);

  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isFocused]);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    const next = trimmed === "" ? null : trimmed;
    if (next !== item.nfReceived) {
      onUpdate(item.id, "nfReceived", next);
    }
  };

  if (isLocked) {
    return (
      <div className="h-full w-full min-h-[36px] px-2 py-2 flex items-center justify-center">
        <span className={`text-sm ${item.nfReceived ? "text-slate-700" : "text-gray-300 italic text-xs"}`}>
          {item.nfReceived || "—"}
        </span>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[36px] px-1 py-1 flex items-center justify-center">
      <input
        ref={inputRef}
        type="text"
        className="w-full h-8 bg-white border border-gray-200 outline-none px-2 py-1 text-sm rounded text-center focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(e) =>
          handleSpreadsheetKeyDown(e, {
            onCommit: () => commit(draft),
            onTab,
            onShiftTab,
            onEnter,
          })
        }
        title="NF recebida"
        aria-label="NF recebida"
        placeholder="—"
      />
    </div>
  );
}

function BillingTypeSelect({
  item,
  hasMissingBillingType,
  isLocked,
  isFocused,
  onUpdate,
  onTab,
  onShiftTab,
  onEnter,
}: {
  item: BudgetItem;
  hasMissingBillingType: boolean;
  isLocked: boolean;
  isFocused: boolean;
  onUpdate: TBudgetItemUpdater;
  onTab: () => void;
  onShiftTab: () => void;
  onEnter: () => void;
}) {
  const [draft, setDraft] = useState(item.billingType);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setDraft(item.billingType);
  }, [item.billingType]);

  useEffect(() => {
    if (isFocused) {
      selectRef.current?.focus();
    }
  }, [isFocused]);

  const commit = (next: BudgetItem["billingType"]) => {
    setDraft(next);
    if (next !== item.billingType) {
      onUpdate(item.id, "billingType", next);
    }
  };

  if (isInternalServiceCategory(item.categoryId)) {
    if (isLocked) {
      return (
        <div className="h-full w-full px-3 py-2 flex items-center text-sm font-medium text-slate-500">
          {item.billingType || "—"}
        </div>
      );
    }

    return (
      <div className="h-full w-full px-1 py-1">
        <select
          ref={selectRef}
          className="h-8 w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm font-medium text-slate-700 outline-none transition-all hover:bg-gray-100 focus:border-gray-300 focus:bg-white"
          value={draft}
          onChange={(e) => commit(e.target.value as BudgetItem["billingType"])}
          onKeyDown={(e) =>
            handleSpreadsheetKeyDown(e, {
              onCommit: () => {},
              onTab,
              onShiftTab,
              onEnter,
            })
          }
        >
          <option value="VIA NF">VIA NF</option>
          <option value="VIA CLIENTE">VIA CLIENTE</option>
        </select>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="h-full w-full px-3 py-2 flex items-center text-sm font-medium text-slate-500">
        {item.billingType || "—"}
      </div>
    );
  }

  return (
    <div className="h-full w-full px-1 py-1">
      <select
        ref={selectRef}
        className={`h-8 w-full rounded border px-2 py-1 text-sm font-medium outline-none transition-all focus:bg-white ${
          hasMissingBillingType
            ? "border-red-300 bg-amber-50 text-red-900 focus:border-red-400"
            : "border-transparent bg-transparent text-slate-700 hover:bg-gray-100 focus:border-gray-300"
        }`}
        value={draft}
        onChange={(e) => commit(e.target.value as BudgetItem["billingType"])}
        onKeyDown={(e) =>
          handleSpreadsheetKeyDown(e, {
            onCommit: () => {},
            onTab,
            onShiftTab,
            onEnter,
          })
        }
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
  onCellTab,
  onCellShiftTab,
  onCellEnter,
  onUpdate,
  isBillingTypeLocked = false,
  isLocked = false,
}: BudgetTableCellProps) {
  const handleTab = () => onCellTab(item.id, field);
  const handleShiftTab = () => onCellShiftTab(item.id, field);
  const handleEnter = () => onCellEnter(item.id, field);

  if (field === "billingType") {
    const hasMissingBillingType = !item.billingType && (item.unitPrice > 0 || item.total > 0);
    const isFocused = editingCell?.id === item.id && editingCell?.field === "billingType";

    return (
      <BillingTypeSelect
        item={item}
        hasMissingBillingType={hasMissingBillingType}
        isLocked={isBillingTypeLocked}
        isFocused={isFocused}
        onUpdate={onUpdate}
        onTab={handleTab}
        onShiftTab={handleShiftTab}
        onEnter={handleEnter}
      />
    );
  }

  if (field === "nfReceived") {
    const isFocused = editingCell?.id === item.id && editingCell?.field === "nfReceived";

    return (
      <NfReceivedCell
        item={item}
        isLocked={isLocked}
        isFocused={isFocused}
        onUpdate={onUpdate}
        onTab={handleTab}
        onShiftTab={handleShiftTab}
        onEnter={handleEnter}
      />
    );
  }

  const isEditing = editingCell?.id === item.id && editingCell?.field === field;
  const isMissingRequiredNumber =
    (field === "quantity" && !item.quantity) || (field === "days" && !item.days);

  if (isEditing) {
    if (type === "textarea") {
      return (
        <div className="h-full w-full px-1 py-1">
          <EditableTextarea
            value={(item[field] as string) ?? ""}
            align={align}
            onCommit={(val) => onUpdate(item.id, field, val)}
            onBlur={onCellBlur}
            onTab={handleTab}
            onShiftTab={handleShiftTab}
            onEnter={handleEnter}
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
            onTab={handleTab}
            onShiftTab={handleShiftTab}
            onEnter={handleEnter}
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
          onTab={handleTab}
          onShiftTab={handleShiftTab}
          onEnter={handleEnter}
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
      className={`w-full h-full min-h-[36px] px-3 py-2 cursor-text hover:bg-gray-100 transition-colors flex items-center ${align === "right" ? "justify-end" : ""} ${
        isMissingRequiredNumber ? "bg-amber-50 ring-1 ring-inset ring-red-200" : ""
      }`}
      onClick={() => onCellClick(item.id, field)}
    >
      <span
        className={`whitespace-pre-wrap break-words ${!displayValue ? "text-gray-300 italic text-xs" : ""} ${
          isMissingRequiredNumber ? "text-red-700 font-medium" : ""
        }`}
      >
        {displayValue || "Obrigatório"}
      </span>
    </div>
  );
}, areBudgetTableCellPropsEqual);
