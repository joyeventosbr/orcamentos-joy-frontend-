import { useMemo } from "react";
import { calculateAdministrativeTax, calculateGrossUpTax } from "@/src/lib/profitability";
import { BudgetItem, HonorariumPercentage } from "@/src/types";

const INTERNAL_SERVICES_CATEGORY_ID = "2.1";

export function calculateInternalServicesSummary(
  items: BudgetItem[],
  planning: number,
  honorariumBase: number,
  honorariumPercentage: number,
  honorariumMinimumFee: number | undefined,
  fatViaJoy: number,
  antecipadoCliente: number,
  prazoDias: number,
  taxNfRate: number,
) {
  const internalItemsTotal = items
    .filter((item) => item.categoryId === INTERNAL_SERVICES_CATEGORY_ID)
    .reduce((sum, item) => sum + item.total, 0);

  const fees = honorariumPercentage === 0 ? honorariumMinimumFee ?? 0 : honorariumBase * (honorariumPercentage / 100);
  const administrativeTaxes = calculateAdministrativeTax(fatViaJoy, antecipadoCliente, prazoDias);
  const subtotal = internalItemsTotal + planning + fees + administrativeTaxes;
  const serviceTax = calculateGrossUpTax(subtotal, taxNfRate);
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
    serviceTaxRate: taxNfRate,
  };
}

export function useInternalServicesSummary(
  items: BudgetItem[],
  planning: number,
  honorariumBase: number,
  honorariumPercentage: number,
  honorariumMinimumFee: number | undefined,
  fatViaJoy: number,
  antecipadoCliente: number,
  prazoDias: number,
  taxNfRate: number,
) {
  return useMemo(
    () =>
      calculateInternalServicesSummary(
        items,
        planning,
        honorariumBase,
        honorariumPercentage,
        honorariumMinimumFee,
        fatViaJoy,
        antecipadoCliente,
        prazoDias,
        taxNfRate,
      ),
    [items, planning, honorariumBase, honorariumPercentage, honorariumMinimumFee, fatViaJoy, antecipadoCliente, prazoDias, taxNfRate],
  );
}
