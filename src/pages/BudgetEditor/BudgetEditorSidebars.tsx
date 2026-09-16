import { BudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { useInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { PaymentScheduleTotals } from "@/src/hooks/usePaymentScheduleSummary";
import { ProfitabilitySummary } from "@/src/hooks/useProfitabilitySummary";
import { BudgetSummaryPanel } from "@/src/pages/BudgetEditor/components/BudgetSummaryPanel";
import { ProfitabilitySidebar } from "@/src/pages/BudgetEditor/components/ProfitabilitySidebar";
import { HonorariumOption, HonorariumRate } from "@/src/types";
import { memo } from "react";

type InternalServicesSummary = ReturnType<typeof useInternalServicesSummary>;

export type BudgetEditorSidebarsProps = {
  activeSidebar: "summary" | "profitability" | null;
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
  profitabilitySummary: ProfitabilitySummary;
  onPlanningChange: (value: number) => void;
  onHonorariumOptionChange: (value: HonorariumOption) => void;
  onHonorariumMinimumFeeChange: (value: number) => void;
};

export const BudgetEditorSidebars = memo(function BudgetEditorSidebars({
  activeSidebar,
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
  profitabilitySummary,
  onPlanningChange,
  onHonorariumOptionChange,
  onHonorariumMinimumFeeChange,
}: BudgetEditorSidebarsProps) {
  return (
    <>
      <BudgetSummaryPanel
        isOpen={activeSidebar === "summary"}
        taxNf={taxNf}
        grandTotal={grandTotal}
        billingSummary={billingSummary}
        paymentTotals={paymentTotals}
        internalServicesSummary={internalServicesSummary}
        honorariumBase={honorariumBase}
        honorariumPercentage={honorariumPercentage}
        honorariumMinimumFee={honorariumMinimumFee}
        advancePayment={advancePayment}
        isLocked={isLocked}
        isSaving={isSaving}
        onPlanningChange={onPlanningChange}
        onHonorariumOptionChange={onHonorariumOptionChange}
        onHonorariumMinimumFeeChange={onHonorariumMinimumFeeChange}
      />
      <ProfitabilitySidebar isOpen={activeSidebar === "profitability"} summary={profitabilitySummary} />
    </>
  );
});
