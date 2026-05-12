import { ProfitabilitySummary } from "@/src/hooks/useProfitabilitySummary";
import { formatCurrencyBRL } from "@/src/lib/formatters";
import { BudgetItem, TBudgetItemUpdater } from "@/src/types";

interface ProfitabilitySidebarProps {
  isOpen: boolean;
  summary: ProfitabilitySummary;
  items: BudgetItem[];
  onUpdateItem: TBudgetItemUpdater;
}


function MetricLine({
  label,
  value,
  strong = false,
  muted = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-2.5">
      <div
        className={
          strong
            ? "text-sm font-black uppercase leading-snug text-gray-900"
            : muted
              ? "text-sm font-semibold leading-snug text-gray-500"
              : "text-sm font-semibold leading-snug text-gray-700"
        }
      >
        {label}
      </div>
      <div
        className={
          strong
            ? "shrink-0 text-right text-base font-black tabular-nums text-gray-900"
            : "shrink-0 text-right text-sm font-bold tabular-nums text-gray-900"
        }
      >
        {formatCurrencyBRL(value)}
      </div>
    </div>
  );
}

function PercentLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-2.5">
      <div className="text-sm font-semibold leading-snug text-gray-700">{label}</div>
      <div className="shrink-0 text-right text-sm font-bold tabular-nums text-gray-900">
        {value.toFixed(2)}%
      </div>
    </div>
  );
}

function RentabilidadeBadge({
  label,
  isRentavel,
}: {
  label: string;
  isRentavel: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-4 py-3 text-center ${
        isRentavel ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
      }`}
    >
      <div className={`text-xs font-bold uppercase tracking-wider ${isRentavel ? "text-green-600" : "text-red-600"}`}>
        {label}
      </div>
      <div className={`text-lg font-black uppercase mt-0.5 ${isRentavel ? "text-green-700" : "text-red-700"}`}>
        {isRentavel ? "Rentável" : "Não Rentável"}
      </div>
    </div>
  );
}

export function ProfitabilitySidebar({ isOpen, summary }: ProfitabilitySidebarProps) {
  return (
    <div
      className={`${isOpen ? "w-[440px] border-l" : "w-0 border-none"} shrink-0 bg-white border-gray-200 shadow-[-4px_0_15px_-10px_rgba(0,0,0,0.05)] z-30 transition-all duration-300 ease-in-out overflow-hidden`}
    >
      <div className="w-[440px] h-full min-h-0 flex flex-col overflow-y-auto">
        <div className="border-b px-7 py-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <RentabilidadeBadge label="Pré Evento - Concorrência" isRentavel={summary.isRentavelPre} />
            <RentabilidadeBadge label="Pós Concorrência" isRentavel={summary.isRentavelProd} />
          </div>
        </div>

        <div className="p-7 flex-1 flex flex-col gap-6">
          <div className="space-y-6">
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Custos & Impostos</h4>

              <div className="divide-y divide-gray-100">
                <MetricLine label="Custos Terceiros Joy" value={summary.custosTerceirosJoy} />
                <MetricLine label="Imposto Joy 18%" value={summary.impostoJoy18} />
              </div>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">BV / Over</h4>

              <div className="divide-y divide-gray-100">
                <MetricLine label="BV / Over Pré" value={summary.bvOverPre} />
                <MetricLine label="BV / Over Prod" value={summary.bvOverProd} />
                <MetricLine label="Imposto Pré sobre BV Over" value={summary.impostoPreSobreBvOver} muted />
                <MetricLine label="Imposto Prod sobre BV Over" value={summary.impostoProdSobreBvOver} muted />
              </div>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Rentabilidade</h4>

              <div className="divide-y divide-gray-100">
                <MetricLine label="Rentabilidade - Pré" value={summary.rentabilidadePre} strong />
                <MetricLine label="Rentabilidade - Prod" value={summary.rentabilidadeProd} strong />
                <PercentLine label="% Rentabilidade - Pré" value={summary.percentRentabilidadePre} />
                <PercentLine label="% Rentabilidade - Prod" value={summary.percentRentabilidadeProd} />
              </div>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Resumo Geral</h4>

              <div className="divide-y divide-gray-100">
                <MetricLine label="Valor Fornecedores" value={summary.grandTotals.valorFornecedor} />
                <MetricLine label="R$ BV Total" value={summary.grandTotals.rsBV} />
                <MetricLine label="Over Total" value={summary.grandTotals.over} />
              </div>

              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <MetricLine label="Valor Real Geral" value={summary.grandTotals.valorReal} strong />
              </div>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Faturamento via JOY</h4>

              <div className="divide-y divide-gray-100">
                <MetricLine label="Valor Fornecedores" value={summary.totalsViaJoy.valorFornecedor} />
                <MetricLine label="R$ BV" value={summary.totalsViaJoy.rsBV} />
                <MetricLine label="Over" value={summary.totalsViaJoy.over} />
              </div>

              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <MetricLine label="Valor Real via JOY" value={summary.totalsViaJoy.valorReal} strong />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
