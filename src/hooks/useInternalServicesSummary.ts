import { useMemo } from "react";
import { calculateAdministrativeTax, calculateGrossUpTax, toRateDecimal } from "@/src/lib/profitability";
import { BudgetItem, HonorariumPercentage } from "@/src/types";

const INTERNAL_SERVICES_CATEGORY_ID = "2.1";
const DEFAULT_SERVICE_TAX_PERCENT = 18;

export function useInternalServicesSummary(
  items: BudgetItem[],
  honorariumBase: number,
  honorariumPercentage: HonorariumPercentage,
  fatViaJoy: number,
  antecipadoCliente: number,
  prazoDias: number,
  taxNfPercent = DEFAULT_SERVICE_TAX_PERCENT,
) {
  return useMemo(() => {
    const internalItemsTotal = items
      .filter((item) => item.categoryId === INTERNAL_SERVICES_CATEGORY_ID)
      .reduce((sum, item) => sum + item.total, 0);

    const planning = 0;
    const fees = honorariumBase * (honorariumPercentage / 100);
    const administrativeTaxes = calculateAdministrativeTax(fatViaJoy, antecipadoCliente, prazoDias);
    const subtotal = internalItemsTotal + planning + fees + administrativeTaxes;
    const serviceTaxRate = toRateDecimal(taxNfPercent);
    const serviceTax = calculateGrossUpTax(subtotal, serviceTaxRate);
    const totalEvent = subtotal + serviceTax;
    const advancePayment = 0;

    return {
      internalItemsTotal,
      planning,
      fees,
      administrativeTaxes,
      subtotal,
      serviceTax,
      totalEvent,
      advancePayment,
      serviceTaxRate,
    };
  }, [items, honorariumBase, honorariumPercentage, fatViaJoy, antecipadoCliente, prazoDias, taxNfPercent]);
}
