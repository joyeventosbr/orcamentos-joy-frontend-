import { formatCurrencyBRL } from "@/src/lib/formatters";
import { HONORARIUM_PERCENTAGE_OPTIONS, HonorariumPercentage } from "@/src/types";

interface InternalServicesSummaryCardProps {
  servicesTotal: number;
  planning: number;
  fees: number;
  honorariumBase: number;
  honorariumPercentage: HonorariumPercentage;
  administrativeTaxes: number;
  subtotal: number;
  serviceTax: number;
  advancePayment: number;
  onHonorariumPercentageChange: (value: HonorariumPercentage) => void;
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
  administrativeTaxes,
  subtotal,
  serviceTax,
  advancePayment,
  onHonorariumPercentageChange,
}: InternalServicesSummaryCardProps) {
  return (
    <section className="border-b border-gray-100 px-7 py-6">
      <div className="divide-y divide-slate-100">
        <SummaryLine label="Serviços internos" value={servicesTotal} />
        <SummaryLine label="Planejamento" value={planning} />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-2.5">
          <div>
            <div className="text-sm font-semibold leading-snug text-slate-700">Honorários</div>
            <div className="mt-0.5 text-xs font-medium text-slate-400">Base: {formatCurrencyBRL(honorariumBase)}</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700 outline-none focus:border-brand-primary"
              value={honorariumPercentage}
              onChange={(event) => onHonorariumPercentageChange(Number(event.target.value) as HonorariumPercentage)}
            >
              {HONORARIUM_PERCENTAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}%
                </option>
              ))}
            </select>
            <div className="min-w-[92px] text-right text-sm font-bold tabular-nums text-slate-900">
              {formatCurrencyBRL(fees)}
            </div>
          </div>
        </div>
        <SummaryLine label="Taxas administrativas" value={administrativeTaxes} />
        <SummaryLine label="Subtotal 2: itens faturados via nota fiscal Joy Eventos" value={subtotal} />
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
