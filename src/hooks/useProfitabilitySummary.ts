import { BUDGET_CATEGORIES, BudgetItem } from "@/src/types";
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

export interface ProfitabilitySummary {
  categories: ProfitabilityCategory[];
  grandTotals: ProfitabilityTotals;
  totalsViaJoy: ProfitabilityTotals;
  isRentavel: boolean;

  custosTerceirosJoy: number;
  impostoJoy18: number;
  bvOverPre: number;
  bvOverProd: number;
  impostoPreSobreBvOver: number;
  impostoProdSobreBvOver: number;
  rentabilidadePre: number;
  rentabilidadeProd: number;
  percentRentabilidadePre: number;
  percentRentabilidadeProd: number;
  isRentavelPre: boolean;
  isRentavelProd: boolean;
}

const EMPTY_TOTALS: ProfitabilityTotals = {
  valorFornecedor: 0,
  rsBV: 0,
  over: 0,
  valorReal: 0,
};

const TAX_RATE = 0.18;

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

export function useProfitabilitySummary(
  primaryItems: BudgetItem[],
  internalServicesCost: number,
  budgetGrandTotal: number,
): ProfitabilitySummary {
  return useMemo(() => {
    const allRows: ProfitabilityRow[] = primaryItems.map((item) => {
      const percentBV = item.percentBV || 0;
      const percentNfOver = item.percentNfOver || 0;
      const isNf = item.billingType === "VIA NF";
      const percentNfBV = isNf ? percentBV : 0;

      const valorFornecedor = item.fornecedorValue || 0;
      const rsBV = valorFornecedor * (percentBV / 100);
      const over = valorFornecedor * (percentNfOver / 100);
      const valorReal = valorFornecedor - rsBV - over;

      return {
        id: item.id,
        categoryId: item.categoryId,
        fornecedor: item.fornecedorName || "",
        valorFornecedor,
        percentBV,
        percentNfBV,
        rsBV,
        percentNfOver,
        over,
        valorReal,
      };
    });

    const categories: ProfitabilityCategory[] = BUDGET_CATEGORIES.filter((cat) => !cat.id.startsWith("2."))
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

    const joyItems = primaryItems.filter((i) => i.billingType === "VIA NF" || i.billingType === "ND OU REPASSE");
    const joyItemIds = new Set(joyItems.map((i) => i.id));
    const joyRows = allRows.filter((r) => joyItemIds.has(r.id));
    const totalsViaJoy = joyRows.length > 0 ? sumTotals(joyRows) : { ...EMPTY_TOTALS };

    // CUSTOS TERCEIROS JOY = soma dos reais valores pagos (fornecedorValue de items via Joy)
    const custosTerceirosJoy = joyItems.reduce((sum, item) => sum + (item.fornecedorValue || 0), 0);

    // IMPOSTO JOY 18% = imposto sobre fornecedores dentro da nota joy e custos internos
    const impostoJoy18 = (custosTerceirosJoy + internalServicesCost) * TAX_RATE;

    // BV / OVER PRÉ = BV + Over calculados sobre item.total (valores orçados/concorrência)
    const bvOverPre = primaryItems.reduce((sum, item) => {
      const percentBV = item.percentBV || 0;
      const percentNfOver = item.percentNfOver || 0;
      const base = item.total || 0;
      return sum + base * (percentBV / 100) + base * (percentNfOver / 100);
    }, 0);

    // BV / OVER PROD = BV + Over calculados sobre fornecedorValue (valores reais/produção)
    const bvOverProd = primaryItems.reduce((sum, item) => {
      const percentBV = item.percentBV || 0;
      const percentNfOver = item.percentNfOver || 0;
      const base = item.fornecedorValue || 0;
      return sum + base * (percentBV / 100) + base * (percentNfOver / 100);
    }, 0);

    // IMPOSTO PRÉ SOBRE BV OVER = 18% sobre BV/Over pré
    const impostoPreSobreBvOver = bvOverPre * TAX_RATE;

    // IMPOSTO PROD SOBRE BV OVER = 18% sobre BV/Over prod
    const impostoProdSobreBvOver = bvOverProd * TAX_RATE;

    // RENTABILIDADE PRÉ = BV/Over pré - imposto pré
    const rentabilidadePre = bvOverPre - impostoPreSobreBvOver;

    // RENTABILIDADE PROD = BV/Over prod - imposto prod
    const rentabilidadeProd = bvOverProd - impostoProdSobreBvOver;

    // % RENTABILIDADE PRÉ = rentabilidade pré / (valor total do evento - custos joy)
    const valorTotalSemCustosJoy = budgetGrandTotal - custosTerceirosJoy;
    const percentRentabilidadePre = valorTotalSemCustosJoy > 0 ? (rentabilidadePre / valorTotalSemCustosJoy) * 100 : 0;

    // % RENTABILIDADE PROD = rentabilidade prod / valor total do evento
    const percentRentabilidadeProd = budgetGrandTotal > 0 ? (rentabilidadeProd / budgetGrandTotal) * 100 : 0;

    const isRentavelPre = rentabilidadePre >= 0;
    const isRentavelProd = rentabilidadeProd >= 0;

    const totalMargin = grandTotals.rsBV + grandTotals.over;
    const isRentavel = grandTotals.valorFornecedor === 0 || totalMargin >= 0;

    return {
      categories,
      grandTotals,
      totalsViaJoy,
      isRentavel,
      custosTerceirosJoy,
      impostoJoy18,
      bvOverPre,
      bvOverProd,
      impostoPreSobreBvOver,
      impostoProdSobreBvOver,
      rentabilidadePre,
      rentabilidadeProd,
      percentRentabilidadePre,
      percentRentabilidadeProd,
      isRentavelPre,
      isRentavelProd,
    };
  }, [primaryItems, internalServicesCost, budgetGrandTotal]);
}
