import { useMemo } from "react";
import { BudgetItem, HonorariumPercentage } from "@/src/types";

const INTERNAL_SERVICES_CATEGORY_ID = "2.1";
const SERVICE_TAX_RATE = 0.18;

export function useInternalServicesSummary(
  items: BudgetItem[],
  honorariumBase: number,
  honorariumPercentage: HonorariumPercentage,
) {
  return useMemo(() => {
    const internalItemsTotal = items
      .filter((item) => item.categoryId === INTERNAL_SERVICES_CATEGORY_ID)
      .reduce((sum, item) => sum + item.total, 0);

    const planning = 0;
    const fees = honorariumBase * (honorariumPercentage / 100);
    const administrativeTaxes = 0;
    const subtotal = internalItemsTotal + planning + fees + administrativeTaxes;
    const serviceTax = subtotal * SERVICE_TAX_RATE;
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
      serviceTaxRate: SERVICE_TAX_RATE,
    };
  }, [items, honorariumBase, honorariumPercentage]);
}
