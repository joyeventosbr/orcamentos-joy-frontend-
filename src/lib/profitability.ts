import { BudgetBillingType, BudgetItem } from "@/src/types";
import { DEFAULT_PROFITABILITY_RATES, ProfitabilityRates } from "./profitabilityRates";

const BILLING_TYPES_WITH_VALOR_TOTAL: ReadonlySet<BudgetBillingType | ""> = new Set([
  "",
  "ND OU REPASSE",
  "VIA NF",
  "VIA CLIENTE",
]);

export type ProfitabilityClassification = "NÃO RENTÁVEL" | "RAZOÁVEL" | "RENTÁVEL";

export interface ProfitabilityItemInput {
  billingType: BudgetItem["billingType"];
  quantity: number;
  days: number;
  unitPrice: number;
  valorFornecedor: number;
  percentBV: number;
  percentNfBV?: number;
  percentNfOver: number;
}

export interface ProfitabilityItemMetrics {
  valorTotal: number;
  percentNfBV: number;
  rsBV: number;
  over: number;
  valorReal: number;
}

export interface ProfitabilityConsolidation {
  fatViaCliente: number;
  fatViaJoy: number;
  impostoNfJoy: number;
  honorarios: number;
  taxaAdmin: number;
  subtotalServicos: number;
  impostoNfServicos: number;
  fatGeral: number;
  totalGeral: number;
  bvPre: number;
  bvProd: number;
  overPre: number;
  overProd: number;
  bvTotal: number;
  overTotal: number;
}

export interface ProfitabilityResult {
  consolidation: ProfitabilityConsolidation;
  valorRealPre: number;
  valorRealProd: number;
  custosTerceiros: number;
  impostoJoy: number;
  impostoBvOverPre: number;
  impostoBvOverProd: number;
  rentabilidadePre: number;
  rentabilidadeProd: number;
  pctRentabilidadePre: number | null;
  pctRentabilidadeProd: number | null;
  classificacaoPre: ProfitabilityClassification | null;
  classificacaoProd: ProfitabilityClassification | null;
  /** Alias de rentabilidadeProd (termômetro final) */
  rentabilidade: number;
  pctRentabilidade: number | null;
  classificacao: ProfitabilityClassification | null;
}

export function isBillingTypeEligibleForValorTotal(billingType: BudgetItem["billingType"]): boolean {
  return BILLING_TYPES_WITH_VALOR_TOTAL.has(billingType);
}

export function toRateDecimal(percentValue: number): number {
  return percentValue / 100;
}

export function safeDivide(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return numerator / denominator;
}

export function resolvePercentNfBV(
  billingType: BudgetItem["billingType"],
  percentBV: number,
  percentNfBV?: number,
): number {
  if (percentNfBV != null) return percentNfBV;
  return billingType === "VIA NF" ? percentBV : 0;
}

export function calculateItemValorTotal(item: Pick<ProfitabilityItemInput, "billingType" | "quantity" | "days" | "unitPrice">): number {
  if (!isBillingTypeEligibleForValorTotal(item.billingType)) return 0;
  return Number(item.quantity) * Number(item.days) * Number(item.unitPrice);
}

export function calculateProfitabilityItem(
  input: ProfitabilityItemInput,
  rates: ProfitabilityRates = DEFAULT_PROFITABILITY_RATES,
): ProfitabilityItemMetrics {
  void rates;

  const valorTotal = calculateItemValorTotal(input);
  const valorFornecedor = Number(input.valorFornecedor) || 0;
  const pctBv = toRateDecimal(input.percentBV || 0);
  const pctNfBv = toRateDecimal(resolvePercentNfBV(input.billingType, input.percentBV || 0, input.percentNfBV));
  const pctNfOver = toRateDecimal(input.percentNfOver || 0);

  const rsBV = valorFornecedor * pctBv * (1 - pctNfBv);
  const over = (valorTotal - valorFornecedor) * (1 - pctNfOver);
  const valorReal = valorFornecedor - rsBV;

  return {
    valorTotal,
    percentNfBV: resolvePercentNfBV(input.billingType, input.percentBV || 0, input.percentNfBV),
    rsBV,
    over,
    valorReal,
  };
}

export function calculateAdministrativeTax(
  fatViaJoy: number,
  antecipadoCliente: number,
  prazoDias: number,
  adminMonthlyRate: number = DEFAULT_PROFITABILITY_RATES.adminMonthlyRate,
): number {
  const base = fatViaJoy - antecipadoCliente;
  if (base <= 0 || prazoDias <= 59) return 0;
  const factor = 1 + adminMonthlyRate;
  if (prazoDias <= 89) return base * adminMonthlyRate;
  if (prazoDias <= 119) return base * (factor ** 2 - 1);
  return base * (factor ** 3 - 1);
}

export function classifyProfitability(
  pctRentabilidade: number | null,
  rates: ProfitabilityRates = DEFAULT_PROFITABILITY_RATES,
): ProfitabilityClassification | null {
  if (pctRentabilidade == null) return null;
  if (pctRentabilidade <= rates.profitabilityNotRentableMax) return "NÃO RENTÁVEL";
  if (pctRentabilidade <= rates.profitabilityReasonableMax) return "RAZOÁVEL";
  return "RENTÁVEL";
}

export interface ProfitabilityConsolidationInput {
  primaryItems: BudgetItem[];
  internalServicesSubtotal: number;
  honorariumPercentage: number;
  prazoDias: number;
  antecipadoCliente: number;
  rates?: ProfitabilityRates;
}

function sumValorTotalByBilling(
  items: BudgetItem[],
  predicate: (billingType: BudgetItem["billingType"]) => boolean,
): number {
  return items.reduce((sum, item) => {
    if (!predicate(item.billingType)) return sum;
    return sum + calculateItemValorTotal(item);
  }, 0);
}

function sumValorTotalWhere(items: BudgetItem[], billingType: BudgetItem["billingType"]): number {
  return sumValorTotalByBilling(items, (type) => type === billingType);
}

export function calculateProfitabilityConsolidation({
  primaryItems,
  internalServicesSubtotal,
  honorariumPercentage,
  prazoDias,
  antecipadoCliente,
  rates = DEFAULT_PROFITABILITY_RATES,
}: ProfitabilityConsolidationInput): ProfitabilityConsolidation {
  const fatViaCliente = sumValorTotalWhere(primaryItems, "VIA CLIENTE");
  const fatViaJoy =
    sumValorTotalWhere(primaryItems, "VIA NF") + sumValorTotalWhere(primaryItems, "ND OU REPASSE");
  const impostoNfJoy = sumValorTotalWhere(primaryItems, "VIA NF") * rates.nfJoyTaxRate;
  const honorarios = (fatViaCliente + fatViaJoy) * toRateDecimal(honorariumPercentage);
  const taxaAdmin = calculateAdministrativeTax(fatViaJoy, antecipadoCliente, prazoDias, rates.adminMonthlyRate);
  const subtotalServicos = internalServicesSubtotal + honorarios + taxaAdmin;
  const impostoNfServicos = subtotalServicos * rates.nfServicesTaxRate;
  const fatGeral = fatViaCliente + fatViaJoy;
  const totalGeral = fatGeral + subtotalServicos + impostoNfServicos;

  let bvPre = 0;
  let bvProd = 0;
  let overPre = 0;
  let overProd = 0;

  primaryItems.forEach((item) => {
    const metrics = calculateProfitabilityItem(mapItemToProfitabilityInput(item), rates);
    bvPre += metrics.rsBV;
    overPre += metrics.over;
  });

  return {
    fatViaCliente,
    fatViaJoy,
    impostoNfJoy,
    honorarios,
    taxaAdmin,
    subtotalServicos,
    impostoNfServicos,
    fatGeral,
    totalGeral,
    bvPre,
    bvProd,
    overPre,
    overProd,
    bvTotal: bvPre + bvProd,
    overTotal: overPre + overProd,
  };
}

export function calculateProfitabilityResult(
  input: ProfitabilityConsolidationInput,
): ProfitabilityResult {
  const rates = input.rates ?? DEFAULT_PROFITABILITY_RATES;
  const consolidation = calculateProfitabilityConsolidation(input);

  let valorRealPre = 0;
  let valorRealProd = 0;

  input.primaryItems.forEach((item) => {
    const metrics = calculateProfitabilityItem(mapItemToProfitabilityInput(item), rates);
    valorRealPre += metrics.valorReal;
  });

  const custosTerceiros = valorRealPre + valorRealProd;
  const impostoJoy = consolidation.impostoNfJoy + consolidation.impostoNfServicos;

  const impostoBvOverPre =
    (consolidation.bvPre + consolidation.overPre) * rates.bvOverTaxRate;
  const impostoBvOverProd =
    (consolidation.bvTotal + consolidation.overTotal) * rates.bvOverTaxRate;

  const rentabilidadePre =
    consolidation.totalGeral -
    custosTerceiros -
    impostoJoy -
    impostoBvOverPre -
    consolidation.overProd;

  const rentabilidadeProd =
    consolidation.totalGeral - custosTerceiros - impostoJoy - impostoBvOverProd;

  const pctRentabilidadePre = safeDivide(rentabilidadePre, consolidation.totalGeral);
  const pctRentabilidadeProd = safeDivide(rentabilidadeProd, consolidation.totalGeral);
  const classificacaoPre = classifyProfitability(pctRentabilidadePre, rates);
  const classificacaoProd = classifyProfitability(pctRentabilidadeProd, rates);

  return {
    consolidation,
    valorRealPre,
    valorRealProd,
    custosTerceiros,
    impostoJoy,
    impostoBvOverPre,
    impostoBvOverProd,
    rentabilidadePre,
    rentabilidadeProd,
    pctRentabilidadePre,
    pctRentabilidadeProd,
    classificacaoPre,
    classificacaoProd,
    rentabilidade: rentabilidadeProd,
    pctRentabilidade: pctRentabilidadeProd,
    classificacao: classificacaoProd,
  };
}

export function mapItemToProfitabilityInput(item: BudgetItem): ProfitabilityItemInput {
  return {
    billingType: item.billingType,
    quantity: item.quantity,
    days: item.days,
    unitPrice: item.unitPrice,
    valorFornecedor: item.fornecedorValue,
    percentBV: item.percentBV,
    percentNfBV: item.percentNfBV,
    percentNfOver: item.percentNfOver,
  };
}

export function mapBudgetItemToProfitabilityMetrics(item: BudgetItem): ProfitabilityItemMetrics {
  return calculateProfitabilityItem(mapItemToProfitabilityInput(item));
}
