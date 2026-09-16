import { BudgetCategory, BudgetItem } from "@/src/types";
import {
  calculateProfitabilityItem,
  calculateProfitabilityResult,
  mapItemToProfitabilityInput,
  ProfitabilityResult,
} from "@/src/lib/profitability";

export type { ProfitabilityClassification } from "@/src/lib/profitability";
import { DEFAULT_PROFITABILITY_RATES, ProfitabilityRates } from "@/src/lib/profitabilityRates";
import { useMemo } from "react";

export interface ProfitabilityRow {
  id: string;
  categoryId: string;
  fornecedor: string;
  valorFornecedor: number;
  percentBV: number;
  percentNfBV: number;
  rsBV: number;
  percentNfOver: number;
  over: number;
  valorReal: number;
}

export interface ProfitabilityTotals {
  valorFornecedor: number;
  rsBV: number;
  over: number;
  valorReal: number;
}

export interface ProfitabilityCategory {
  categoryId: string;
  categoryName: string;
  rows: ProfitabilityRow[];
  totals: ProfitabilityTotals;
}

export interface ProfitabilitySummary extends ProfitabilityResult {
  categories: ProfitabilityCategory[];
  grandTotals: ProfitabilityTotals;
  totalsViaJoy: ProfitabilityTotals;
}

const EMPTY_TOTALS: ProfitabilityTotals = {
  valorFornecedor: 0,
  rsBV: 0,
  over: 0,
  valorReal: 0,
};

function sumTotals(items: ProfitabilityRow[]): ProfitabilityTotals {
  return items.reduce(
    (acc, row) => ({
      valorFornecedor: acc.valorFornecedor + row.valorFornecedor,
      rsBV: acc.rsBV + row.rsBV,
      over: acc.over + row.over,
      valorReal: acc.valorReal + row.valorReal,
    }),
    { ...EMPTY_TOTALS },
  );
}

function mapItemToRow(item: BudgetItem, rates: ProfitabilityRates): ProfitabilityRow {
  const metrics = calculateProfitabilityItem(mapItemToProfitabilityInput(item), rates);
  return {
    id: item.id,
    categoryId: item.categoryId,
    fornecedor: item.fornecedorName || "",
    valorFornecedor: item.fornecedorValue || 0,
    percentBV: item.percentBV || 0,
    percentNfBV: metrics.percentNfBV,
    rsBV: metrics.rsBV,
    percentNfOver: item.percentNfOver || 0,
    over: metrics.over,
    valorReal: metrics.valorReal,
  };
}

export interface UseProfitabilitySummaryInput {
  primaryItems: BudgetItem[];
  internalServiceItems?: BudgetItem[];
  categories: BudgetCategory[];
  internalServicesSubtotal: number;
  honorariumPercentage: number;
  honorariumMinimumFee?: number;
  honorariumBase: number;
  prazoDias: number;
  antecipadoCliente: number;
  rates?: ProfitabilityRates;
}

export function useProfitabilitySummary({
  primaryItems,
  internalServiceItems = [],
  categories,
  internalServicesSubtotal,
  honorariumPercentage,
  honorariumMinimumFee,
  honorariumBase,
  prazoDias,
  antecipadoCliente,
  rates = DEFAULT_PROFITABILITY_RATES,
}: UseProfitabilitySummaryInput): ProfitabilitySummary {
  return useMemo(() => {
    const primaryRows = primaryItems.map((item) => mapItemToRow(item, rates));
    const internalRows = internalServiceItems.map((item) => mapItemToRow(item, rates));
    const allRows = [...primaryRows, ...internalRows];

    const profitabilityCategories: ProfitabilityCategory[] = categories
      .map((cat) => {
        const catRows = allRows.filter((r) => r.categoryId === cat.id);
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          rows: catRows,
          totals: sumTotals(catRows),
        };
      })
      .filter((cat) => cat.rows.length > 0);

    const grandTotals = sumTotals(allRows);

    const joyItems = [...primaryItems, ...internalServiceItems].filter(
      (i) => i.billingType === "VIA NF" || i.billingType === "ND OU REPASSE",
    );
    const joyItemIds = new Set(joyItems.map((i) => i.id));
    const joyRows = allRows.filter((r) => joyItemIds.has(r.id));
    const totalsViaJoy = joyRows.length > 0 ? sumTotals(joyRows) : { ...EMPTY_TOTALS };

    const result = calculateProfitabilityResult({
      primaryItems,
      internalServiceItems,
      internalServicesSubtotal,
      honorariumPercentage,
      honorariumMinimumFee,
      honorariumBase,
      prazoDias,
      antecipadoCliente,
      rates,
    });

    return {
      ...result,
      categories: profitabilityCategories,
      grandTotals,
      totalsViaJoy,
    };
  }, [
    primaryItems,
    internalServiceItems,
    categories,
    internalServicesSubtotal,
    honorariumPercentage,
    honorariumMinimumFee,
    honorariumBase,
    prazoDias,
    antecipadoCliente,
    rates,
  ]);
}
