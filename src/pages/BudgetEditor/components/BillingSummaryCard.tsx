import { BillingSummaryMetric, BudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";

interface BillingSummaryCardProps {
  summary: BudgetBillingSummary;
  formatCurrency: (value: number) => string;
}

function MetricRow({
  metric,
  formatCurrency,
}: {
  metric: BillingSummaryMetric;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-2.5">
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-snug text-slate-700">{metric.spreadsheetLabel}</div>
        <div className="mt-0.5 text-xs font-medium text-slate-400">
          {metric.itemCount} {metric.itemCount === 1 ? "item" : "itens"}
        </div>
      </div>
      <div className="shrink-0 text-right text-sm font-bold tabular-nums text-slate-900">
        {formatCurrency(metric.amount)}
      </div>
    </div>
  );
}

export function BillingSummaryCard({ summary, formatCurrency }: BillingSummaryCardProps) {
  const highlightedMetrics = summary.metrics.filter((metric) => metric.key !== "unfilled");
  const hasBillingTypeIssues = summary.billingTypeIssues.itemCount > 0;

  return (
    <section className="border-b border-gray-100 px-7 py-6">
      <div className="divide-y divide-slate-100">
        {highlightedMetrics.map((metric) => (
          <div key={metric.key}>
            <MetricRow metric={metric} formatCurrency={formatCurrency} />
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-6 py-3">
          <div>
            <div className="text-sm font-black uppercase text-slate-900">
              Subtotal 1: faturamento FORNECEDORES GERAL
            </div>
            <div className="mt-0.5 text-xs font-medium text-slate-400">Cliente + Joy + Imposto NF</div>
          </div>
          <div className="shrink-0 text-right text-base font-black tabular-nums text-slate-900">
            {formatCurrency(summary.totalSuppliers)}
          </div>
        </div>

        {hasBillingTypeIssues && (
          <div className="rounded-lg bg-amber-50 px-3 py-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6">
              <div>
                <div className="text-sm font-black leading-snug text-amber-900">
                  Preencha o Tipo Faturamento
                </div>
                <div className="mt-0.5 text-xs font-semibold leading-snug text-amber-700">
                  {summary.billingTypeIssues.itemCount}{" "}
                  {summary.billingTypeIssues.itemCount === 1 ? "item tem" : "itens têm"} valor total sem classificação.
                </div>
              </div>
              <div className="shrink-0 text-right text-sm font-black tabular-nums text-amber-900">
                {formatCurrency(summary.billingTypeIssues.amount)}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
