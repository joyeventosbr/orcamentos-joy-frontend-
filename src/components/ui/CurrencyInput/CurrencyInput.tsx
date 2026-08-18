import { Input } from "@/src/components/ui/Input/Input";
import { cn } from "@/src/lib/utils";
import { useEffect, useState } from "react";

const CURRENCY_DRAFT_PATTERN = /^\d*(?:[.,]\d{0,2})?$/;

function valueToDraft(value: number): string {
  if (value === 0) return "";
  return String(value).replace(".", ",");
}

function formatValue(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface CurrencyInputProps {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
}

export function CurrencyInput({
  value,
  onValueChange,
  disabled,
  id,
  className,
  ariaLabel,
  autoFocus,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState(() => valueToDraft(value));

  useEffect(() => {
    if (!isFocused) setDraft(valueToDraft(value));
  }, [value, isFocused]);

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400"
        aria-hidden
      >
        R$
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={ariaLabel}
        value={isFocused ? draft : formatValue(value)}
        className={cn("pl-9 text-right tabular-nums", className)}
        onFocus={(event) => {
          setDraft(valueToDraft(value));
          setIsFocused(true);
          requestAnimationFrame(() => event.currentTarget.select());
        }}
        onChange={(event) => {
          const nextDraft = event.target.value;
          if (!CURRENCY_DRAFT_PATTERN.test(nextDraft)) return;

          setDraft(nextDraft);
          const normalized = nextDraft.replace(",", ".");
          const parsed = normalized === "" ? 0 : Number(normalized);
          if (Number.isFinite(parsed) && parsed >= 0) onValueChange(parsed);
        }}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}
