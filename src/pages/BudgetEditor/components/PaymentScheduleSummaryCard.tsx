import { PAYMENT_SCHEDULE_COLUMNS, PaymentScheduleTotals } from "@/src/hooks/usePaymentScheduleSummary";

interface PaymentScheduleSummaryCardProps {
  formatCurrency: (value: number) => string;
  totals: PaymentScheduleTotals;
}

export function PaymentScheduleSummaryCard({ formatCurrency, totals }: PaymentScheduleSummaryCardProps) {
  return (
    <section className="border-b border-gray-100 px-7 py-6">
      <div className="mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Cronograma de Pagamento
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {PAYMENT_SCHEDULE_COLUMNS.map((column) => (
          <div key={column.field} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-2.5">
            <div className="text-sm font-semibold leading-snug text-slate-700">{column.label}</div>
            <div className="shrink-0 text-right text-sm font-bold tabular-nums text-slate-900">
              {formatCurrency(totals[column.field])}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
