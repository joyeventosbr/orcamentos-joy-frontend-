import { Input } from "@/src/components/ui/Input/Input";
import { sanitizePercentInput } from "@/src/lib/percentInput";
import { cn } from "@/src/lib/utils";

interface PercentageInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  id?: string;
}

export function PercentageInput({
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  placeholder = "0,00",
  id,
}: PercentageInputProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        aria-invalid={invalid}
        placeholder={placeholder}
        value={value}
        className={cn("pr-9 tabular-nums")}
        onChange={(event) => onChange(sanitizePercentInput(event.target.value))}
        onBlur={onBlur}
      />
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400"
        aria-hidden
      >
        %
      </span>
    </div>
  );
}
