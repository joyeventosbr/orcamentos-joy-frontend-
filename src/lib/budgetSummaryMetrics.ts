import { mapLineToItem, PAYMENT_TERM_TO_DEADLINE } from "@/src/api/budgets/budgets.mappers";
import { calculateBudgetBillingSummary } from "@/src/hooks/useBudgetBillingSummary";
import { calculateInternalServicesSummary } from "@/src/hooks/useInternalServicesSummary";
import { calculatePaymentScheduleTotals } from "@/src/hooks/usePaymentScheduleSummary";
import { calculateProfitabilityResult, resolveTaxNfFactor } from "@/src/lib/profitability";
import { DEFAULT_PROFITABILITY_RATES } from "@/src/lib/profitabilityRates";
import { HonorariumPercentage } from "@/src/types";
import { BudgetDetail } from "@/src/types/api.types";

export interface BudgetCardMetrics {
  grandTotal: number;
  pctRentabilidade: number | null;
}

const DEFAULT_HONORARIUM_PERCENTAGE: HonorariumPercentage = 10;

export function computeBudgetCardMetrics(detail: BudgetDetail): BudgetCardMetrics {
  const items = detail.lines.map(mapLineToItem);
  const primaryBudgetItems = items.filter((item) => !item.categoryId.startsWith("2."));
  const internalBudgetItems = items.filter((item) => item.categoryId.startsWith("2."));

  const taxNfFactor = resolveTaxNfFactor(detail.taxNf);
  const taxNfRate = taxNfFactor > 0 ? 1 - taxNfFactor : 0;
  const profitabilityRates = {
    ...DEFAULT_PROFITABILITY_RATES,
    nfJoyTaxRate: taxNfRate,
    nfServicesTaxRate: taxNfRate,
  };

  const billingSummary = calculateBudgetBillingSummary(primaryBudgetItems, taxNfRate);
  const paymentTotals = calculatePaymentScheduleTotals(items);
  const prazoDias = detail.paymentTerm ? Number(PAYMENT_TERM_TO_DEADLINE[detail.paymentTerm]) : 0;
  const antecipadoCliente = paymentTotals.paymentAdvance;
  const fatViaJoy = billingSummary.metrics.find((metric) => metric.key === "joy")?.amount ?? 0;

  const internalServicesSummary = calculateInternalServicesSummary(
    items,
    detail.projectedValue ?? 0,
    billingSummary.honorariumBase,
    DEFAULT_HONORARIUM_PERCENTAGE,
    fatViaJoy,
    antecipadoCliente,
    prazoDias,
    taxNfRate,
  );

  const profitabilityResult = calculateProfitabilityResult({
    primaryItems: primaryBudgetItems,
    internalServiceItems: internalBudgetItems,
    internalServicesSubtotal: internalServicesSummary.internalItemsTotal + internalServicesSummary.planning,
    honorariumPercentage: DEFAULT_HONORARIUM_PERCENTAGE,
    prazoDias,
    antecipadoCliente,
    rates: profitabilityRates,
  });

  const grandTotal =
    internalServicesSummary.subtotal + internalServicesSummary.serviceTax + billingSummary.totalSuppliers;

  return {
    grandTotal,
    pctRentabilidade: profitabilityResult.pctRentabilidadeProd,
  };
}
