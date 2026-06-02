import { ProfitabilityClassification, ProfitabilitySummary } from "@/src/hooks/useProfitabilitySummary";
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

function PercentLine({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-2.5">
      <div className="text-sm font-semibold leading-snug text-gray-700">{label}</div>
      <div className="shrink-0 text-right text-sm font-bold tabular-nums text-gray-900">
        {value == null ? "—" : `${(value * 100).toFixed(2)}%`}
      </div>
    </div>
  );
}

const CLASSIFICATION_STYLES: Record<
  ProfitabilityClassification,
  { container: string; label: string; text: string }
> = {
  "NÃO RENTÁVEL": {
    container: "bg-red-50 border border-red-200",
    label: "text-red-600",
    text: "text-red-700",
  },
  RAZOÁVEL: {
    container: "bg-amber-50 border border-amber-200",
    label: "text-amber-600",
    text: "text-amber-700",
  },
  RENTÁVEL: {
    container: "bg-green-50 border border-green-200",
    label: "text-green-600",
    text: "text-green-700",
  },
};

function TermometroBadge({
  title,
  classificacao,
  pctRentabilidade,
}: {
  title: React.ReactNode;
  classificacao: ProfitabilityClassification | null;
  pctRentabilidade: number | null;
}) {
  if (!classificacao) {
    return (
      <div className="rounded-lg px-4 py-3 text-center bg-gray-50 border border-gray-200">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-snug">{title}</div>
        <div className="text-lg font-black uppercase mt-1 text-gray-400">—</div>
      </div>
    );
  }

  const styles = CLASSIFICATION_STYLES[classificacao];
  return (
    <div className={`rounded-lg px-4 py-3 text-center ${styles.container}`}>
      <div className={`text-[10px] font-bold uppercase tracking-wider leading-snug ${styles.label}`}>{title}</div>
      <div className={`text-lg font-black uppercase mt-1 ${styles.text}`}>{classificacao}</div>
      {pctRentabilidade != null && (
        <div className={`text-xs font-bold tabular-nums mt-1 ${styles.label}`}>
          {(pctRentabilidade * 100).toFixed(2)}%
        </div>
      )}
    </div>
  );
}

export function ProfitabilitySidebar({ isOpen, summary }: ProfitabilitySidebarProps) {
  const { consolidation } = summary;

  return (
    <div
      className={`${isOpen ? "w-[440px] border-l" : "w-0 border-none"} shrink-0 bg-white border-gray-200 shadow-[-4px_0_15px_-10px_rgba(0,0,0,0.05)] z-30 transition-all duration-300 ease-in-out overflow-hidden`}
    >
      <div className="w-[440px] h-full min-h-0 flex flex-col overflow-y-auto">
        <div className="border-b px-7 py-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <TermometroBadge
              title="Termômetro Pré Evento – Concorrência"
              classificacao={summary.classificacaoPre}
              pctRentabilidade={summary.pctRentabilidadePre}
            />
            <TermometroBadge
              title={
                <>
                  Termômetro Final
                  <br />
                  Pós Concorrência
                </>
              }
              classificacao={summary.classificacaoProd}
              pctRentabilidade={summary.pctRentabilidadeProd}
            />
          </div>
        </div>

        <div className="p-7 flex-1 flex flex-col gap-6">
          <div className="space-y-6">
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Consolidação</h4>
              <div className="divide-y divide-gray-100">
                <MetricLine label="Faturamento via Cliente" value={consolidation.fatViaCliente} muted />
                <MetricLine label="Faturamento via Joy" value={consolidation.fatViaJoy} muted />
                <MetricLine label="Imposto NF Joy" value={consolidation.impostoNfJoy} muted />
                <MetricLine label="Honorários" value={consolidation.honorarios} muted />
                <MetricLine label="Taxa administrativa" value={consolidation.taxaAdmin} muted />
                <MetricLine label="Subtotal serviços" value={consolidation.subtotalServicos} />
                <MetricLine label="Imposto NF serviços" value={consolidation.impostoNfServicos} muted />
                <MetricLine label="Total geral" value={consolidation.totalGeral} strong />
              </div>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">BV / Over</h4>
              <div className="divide-y divide-gray-100">
                <MetricLine label="BV / Over Pré" value={consolidation.bvPre + consolidation.overPre} />
                <MetricLine label="BV / Over Prod" value={consolidation.bvProd + consolidation.overProd} muted />
                <MetricLine label="BV / Over Total" value={consolidation.bvTotal + consolidation.overTotal} />
                <MetricLine label="Imposto Pré sobre BV + Over" value={summary.impostoBvOverPre} muted />
                <MetricLine label="Imposto Prod sobre BV + Over" value={summary.impostoBvOverProd} muted />
              </div>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Custos & Impostos</h4>
              <div className="divide-y divide-gray-100">
                <MetricLine label="Custos terceiros" value={summary.custosTerceiros} />
                <MetricLine label="Imposto Joy (NF + serviços)" value={summary.impostoJoy} muted />
              </div>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Rentabilidade</h4>
              <div className="divide-y divide-gray-100">
                <MetricLine label="Rentabilidade - Pré" value={summary.rentabilidadePre} strong />
                <PercentLine label="% Rentabilidade - Pré" value={summary.pctRentabilidadePre} />
                <MetricLine label="Rentabilidade - Prod" value={summary.rentabilidadeProd} strong />
                <PercentLine label="% Rentabilidade - Prod" value={summary.pctRentabilidadeProd} />
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
