import { cn } from "@/src/lib/utils";
import { BudgetPhase, BudgetStatus } from "@/src/types";
import { ChevronDown } from "lucide-react";

const STATUS_OPTIONS_BY_PHASE: Record<BudgetPhase, BudgetStatus[]> = {
  concorrencia: ["Concorrência", "Aprovado"],
  producao: ["Produção", "Aprovado"],
};

const STATUS_STYLES: Record<BudgetStatus, string> = {
  Concorrência: "bg-gray-50 text-gray-800 border-gray-300 hover:border-gray-400 hover:bg-gray-100",
  Aprovado: "bg-green-50 text-green-800 border-green-300 hover:border-green-400 hover:bg-green-100",
  Produção: "bg-amber-50 text-amber-800 border-amber-300 hover:border-amber-400 hover:bg-amber-100",
};

interface BudgetStatusSelectProps {
  phase: BudgetPhase;
  value: BudgetStatus;
  onChange: (status: BudgetStatus) => void;
}

export function BudgetStatusSelect({ phase, value, onChange }: BudgetStatusSelectProps) {
  const options = STATUS_OPTIONS_BY_PHASE[phase];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as BudgetStatus)}
          title="Alterar status do orçamento"
          aria-label="Status do orçamento"
          className={cn(
            "appearance-none rounded-lg pl-3 pr-8 py-1.5 text-sm font-semibold border cursor-pointer",
            "shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-1",
            "transition-all",
            STATUS_STYLES[value],
          )}
        >
          {options.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70"
          aria-hidden
        />
      </div>
    </div>
  );
}
