import { BillingSummaryCard } from "./BillingSummaryCard";
import { InternalServicesSummaryCard } from "./InternalServicesSummaryCard";
import { PaymentScheduleSummaryCard } from "./PaymentScheduleSummaryCard";
import { formatCurrencyBRL } from "@/src/lib/formatters";
import { BudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { PaymentScheduleTotals } from "@/src/hooks/usePaymentScheduleSummary";
import { useInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { HonorariumPercentage } from "@/src/types";

type InternalServicesSummary = ReturnType<typeof useInternalServicesSummary>;

interface BudgetSummaryPanelProps {
  isOpen: boolean;
  grandTotal: number;
  billingSummary: BudgetBillingSummary;
  paymentTotals: PaymentScheduleTotals;
  internalServicesSummary: InternalServicesSummary;
  honorariumBase: number;
  honorariumPercentage: HonorariumPercentage;
  advancePayment: number;
  onHonorariumPercentageChange: (value: HonorariumPercentage) => void;
}

export function BudgetSummaryPanel({
  isOpen,
  grandTotal,
  billingSummary,
  paymentTotals,
  internalServicesSummary,
  honorariumBase,
  honorariumPercentage,
  advancePayment,
  onHonorariumPercentageChange,
}: BudgetSummaryPanelProps) {
  return (
    <div
      className={`${isOpen ? "w-[440px] border-l" : "w-0 border-none"} flex-shrink-0 bg-white border-gray-200 shadow-[-4px_0_15px_-10px_rgba(0,0,0,0.05)] z-30 transition-all duration-300 ease-in-out overflow-hidden`}
    >
      <div className="w-[440px] h-full min-h-0 flex flex-col overflow-y-auto">
        <div className="border-b border-gray-100 px-7 py-6">
          <div className="flex items-baseline justify-between gap-6">
            <div className="text-sm font-semibold text-slate-700">TOTAL GERAL EVENTO</div>
            <div className="text-right text-2xl font-black tracking-tight text-slate-900 tabular-nums">
              {formatCurrencyBRL(grandTotal)}
            </div>
          </div>
        </div>

        <BillingSummaryCard summary={billingSummary} formatCurrency={formatCurrencyBRL} />

        <PaymentScheduleSummaryCard formatCurrency={formatCurrencyBRL} totals={paymentTotals} />

        <InternalServicesSummaryCard
          servicesTotal={internalServicesSummary.internalItemsTotal}
          planning={internalServicesSummary.planning}
          fees={internalServicesSummary.fees}
          honorariumBase={honorariumBase}
          honorariumPercentage={honorariumPercentage}
          administrativeTaxes={internalServicesSummary.administrativeTaxes}
          subtotal={internalServicesSummary.subtotal}
          serviceTax={internalServicesSummary.serviceTax}
          advancePayment={advancePayment}
          onHonorariumPercentageChange={onHonorariumPercentageChange}
        />
      </div>
    </div>
  );
}
