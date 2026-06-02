/** Taxas padrão (decimais). Configuráveis via settings no futuro. */
export interface ProfitabilityRates {
  nfJoyTaxRate: number;
  nfServicesTaxRate: number;
  bvOverTaxRate: number;
  honorariumRate: number;
  adminMonthlyRate: number;
  profitabilityNotRentableMax: number;
  profitabilityReasonableMax: number;
}

export const DEFAULT_PROFITABILITY_RATES: ProfitabilityRates = {
  nfJoyTaxRate: 0.18,
  nfServicesTaxRate: 0.18,
  bvOverTaxRate: 0.18,
  honorariumRate: 0.15,
  adminMonthlyRate: 0.03,
  profitabilityNotRentableMax: 0.19,
  profitabilityReasonableMax: 0.25,
};
