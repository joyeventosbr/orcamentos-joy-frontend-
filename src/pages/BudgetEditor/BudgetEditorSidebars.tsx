import { BudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { useInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { PaymentScheduleTotals } from "@/src/hooks/usePaymentScheduleSummary";
import { ProfitabilitySummary } from "@/src/hooks/useProfitabilitySummary";
import { BudgetSummaryPanel } from "@/src/pages/BudgetEditor/components/BudgetSummaryPanel";
import { ProfitabilitySidebar } from "@/src/pages/BudgetEditor/components/ProfitabilitySidebar";
import { HonorariumPercentage } from "@/src/types";
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
  honorariumPercentage: HonorariumPercentage;
  advancePayment: number;
  isLocked: boolean;
  isSaving: boolean;
  profitabilitySummary: ProfitabilitySummary;
  onPlanningChange: (value: number) => void;
  onHonorariumPercentageChange: (value: HonorariumPercentage) => void;
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
  advancePayment,
  isLocked,
  isSaving,
  profitabilitySummary,
  onPlanningChange,
  onHonorariumPercentageChange,
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
        advancePayment={advancePayment}
        isLocked={isLocked}
        isSaving={isSaving}
        onPlanningChange={onPlanningChange}
        onHonorariumPercentageChange={onHonorariumPercentageChange}
      />
      <ProfitabilitySidebar isOpen={activeSidebar === "profitability"} summary={profitabilitySummary} />
    </>
  );
});
