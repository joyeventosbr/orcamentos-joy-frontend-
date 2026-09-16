import { BudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { useInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { PaymentScheduleTotals } from "@/src/hooks/usePaymentScheduleSummary";
import { formatCurrencyBRL, formatTaxNfFactor } from "@/src/lib/formatters";
import { HonorariumOption, HonorariumRate } from "@/src/types";
import { BillingSummaryCard } from "./BillingSummaryCard";
import { InternalServicesSummaryCard } from "./InternalServicesSummaryCard";
import { PaymentScheduleSummaryCard } from "./PaymentScheduleSummaryCard";

type InternalServicesSummary = ReturnType<typeof useInternalServicesSummary>;

interface BudgetSummaryPanelProps {
  isOpen: boolean;
  taxNf: number;
  grandTotal: number;
  billingSummary: BudgetBillingSummary;
  paymentTotals: PaymentScheduleTotals;
  internalServicesSummary: InternalServicesSummary;
  honorariumBase: number;
  honorariumPercentage: HonorariumRate;
  honorariumMinimumFee: number;
  advancePayment: number;
  isLocked: boolean;
  isSaving: boolean;
  onPlanningChange: (value: number) => void;
  onHonorariumOptionChange: (value: HonorariumOption) => void;
  onHonorariumMinimumFeeChange: (value: number) => void;
}

export function BudgetSummaryPanel({
  isOpen,
  taxNf,
  grandTotal,
  billingSummary,
  paymentTotals,
  internalServicesSummary,
  honorariumBase,
  honorariumPercentage,
  honorariumMinimumFee,
  advancePayment,
  isLocked,
  isSaving,
  onPlanningChange,
  onHonorariumOptionChange,
  onHonorariumMinimumFeeChange,
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

        <div className="border-b border-gray-100 px-7 py-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Fator NF</div>
              <div className="mt-0.5 text-[11px] text-slate-400">Congelada na criação do orçamento</div>
            </div>
            <div className="text-base font-black tabular-nums text-slate-900">{formatTaxNfFactor(taxNf)}</div>
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
          honorariumMinimumFee={honorariumMinimumFee}
          administrativeTaxes={internalServicesSummary.administrativeTaxes}
          subtotal={internalServicesSummary.subtotal}
          serviceTax={internalServicesSummary.serviceTax}
          advancePayment={advancePayment}
          isLocked={isLocked}
          isSaving={isSaving}
          onPlanningChange={onPlanningChange}
          onHonorariumOptionChange={onHonorariumOptionChange}
          onHonorariumMinimumFeeChange={onHonorariumMinimumFeeChange}
        />
      </div>
    </div>
  );
}
