import { CurrencyInput } from "@/src/components/ui/CurrencyInput/CurrencyInput";
import { formatCurrencyBRL } from "@/src/lib/formatters";
import {
  HONORARIUM_PERCENTAGE_OPTIONS,
  HonorariumOption,
  HonorariumPercentage,
  HonorariumRate,
  MINIMUM_FEE_HONORARIUM_OPTION,
} from "@/src/types";
import { useEffect, useState } from "react";

interface InternalServicesSummaryCardProps {
  servicesTotal: number;
  planning: number;
  fees: number;
  honorariumBase: number;
  honorariumPercentage: HonorariumRate;
  honorariumMinimumFee: number;
  administrativeTaxes: number;
  subtotal: number;
  serviceTax: number;
  advancePayment: number;
  isLocked: boolean;
  isSaving: boolean;
  onPlanningChange: (value: number) => void;
  onHonorariumOptionChange: (value: HonorariumOption) => void;
  onHonorariumMinimumFeeChange: (value: number) => void;
}

function SummaryLine({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-2.5">
      <div
        className={
          strong
            ? "text-sm font-black uppercase leading-snug text-slate-950"
            : "text-sm font-semibold leading-snug text-slate-700"
        }
      >
        {label}
      </div>
      <div
        className={
          strong
            ? "shrink-0 text-right text-base font-black tabular-nums text-slate-950"
            : "shrink-0 text-right text-sm font-bold tabular-nums text-slate-900"
        }
      >
        {formatCurrencyBRL(value)}
      </div>
    </div>
  );
}

export function InternalServicesSummaryCard({
  servicesTotal,
  planning,
  fees,
  honorariumBase,
  honorariumPercentage,
  honorariumMinimumFee,
  administrativeTaxes,
  subtotal,
  serviceTax,
  advancePayment,
  isLocked,
  isSaving,
  onPlanningChange,
  onHonorariumOptionChange,
  onHonorariumMinimumFeeChange,
}: InternalServicesSummaryCardProps) {
  const selectedHonorariumOption = honorariumPercentage === 0 ? MINIMUM_FEE_HONORARIUM_OPTION : honorariumPercentage;
  const [draftOption, setDraftOption] = useState<HonorariumOption>(selectedHonorariumOption);

  useEffect(() => {
    setDraftOption(selectedHonorariumOption);
  }, [selectedHonorariumOption]);

  return (
    <section className="border-b border-gray-100 px-7 py-6">
      <div className="divide-y divide-slate-100">
        <SummaryLine label="Serviços internos" value={servicesTotal} />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-2.5">
          <label htmlFor="planning-value" className="text-sm font-semibold leading-snug text-slate-700">
            Planejamento
          </label>
          {isLocked ? (
            <div className="shrink-0 text-right text-sm font-bold tabular-nums text-slate-900">
              {formatCurrencyBRL(planning)}
            </div>
          ) : (
            <CurrencyInput
              id="planning-value"
              ariaLabel="Valor de planejamento"
              value={planning}
              onValueChange={onPlanningChange}
              disabled={isSaving}
              className="h-8 w-44 text-sm font-bold"
            />
          )}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-2.5">
          <div>
            <div className="text-sm font-semibold leading-snug text-slate-700">Honorários</div>
            <div className="mt-0.5 text-xs font-medium text-slate-400">Base: {formatCurrencyBRL(honorariumBase)}</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700 outline-none focus:border-brand-primary"
              value={draftOption}
              disabled={isLocked || isSaving}
              onChange={(event) => {
                const next = event.target.value === MINIMUM_FEE_HONORARIUM_OPTION
                  ? MINIMUM_FEE_HONORARIUM_OPTION
                  : (Number(event.target.value) as HonorariumPercentage);
                setDraftOption(next);
                onHonorariumOptionChange(next);
              }}
            >
              {HONORARIUM_PERCENTAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}%
                </option>
              ))}
              <option value={MINIMUM_FEE_HONORARIUM_OPTION}>Fee Mínimo</option>
            </select>
            {honorariumPercentage === 0 && !isLocked ? (
              <CurrencyInput
                id="honorarium-minimum-fee"
                ariaLabel="Valor mínimo de honorários"
                value={honorariumMinimumFee}
                onValueChange={onHonorariumMinimumFeeChange}
                disabled={isSaving}
                autoFocus
                className="h-8 w-32 text-sm font-bold"
              />
            ) : (
              <div className="min-w-[92px] text-right text-sm font-bold tabular-nums text-slate-900">
                {formatCurrencyBRL(fees)}
              </div>
            )}
          </div>
        </div>
        <SummaryLine label="Taxas administrativas" value={administrativeTaxes} />
        <SummaryLine label="Subtotal: serviços internos" value={subtotal} />
        <SummaryLine label="Imposto NF Serviços Joy" value={serviceTax} />
      </div>

      <div className="mt-5 space-y-3 text-xs font-semibold leading-5 text-slate-600">
        <div>Condição de Pagamento: fornecedores faturados via nota de débito Joy Eventos - 45 dias</div>
        <div className="rounded-lg bg-gray-200 p-3 font-black uppercase text-slate-950 border border-gray-300">
          EXCETO PARA CONTRATAÇÃO DE LOCAIS E ARTÍSTICO QUE DEVERÃO SER NEGOCIADOS VALORES DE ADIANTAMENTO PARA PRE
          BLOQUEIO
        </div>

        <SummaryLine label="Adiantamento" value={advancePayment} strong />
        <div className="text-xs text-slate-500 leading-relaxed">
          <div className="font-semibold text-slate-600">Política de cancelamento:</div>
          <div>Honorários: 80% - 15d antes do evento</div>
          <div>Honorários: 50% - 30d antes do evento</div>
          <div>Planejamento: 100% - 30d antes do evento</div>
          <div>Custos aprovados: conforme contratação mediante comprovante</div>
        </div>
      </div>
    </section>
  );
}
