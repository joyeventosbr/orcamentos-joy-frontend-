import { ProfitabilityCategory } from "@/src/hooks/useProfitabilitySummary";

function profitabilityCategoryTotalsEqual(a: ProfitabilityCategory, b: ProfitabilityCategory): boolean {
  return (
    a.totals.valorFornecedor === b.totals.valorFornecedor &&
    a.totals.rsBV === b.totals.rsBV &&
    a.totals.over === b.totals.over &&
    a.totals.valorReal === b.totals.valorReal &&
    a.rows.length === b.rows.length
  );
}

/** Reutiliza objetos de rentabilidade por categoria quando os totais não mudaram. */
export function buildStableProfitabilityCategoryMap(
  categories: ProfitabilityCategory[] | undefined,
  previous: Map<string, ProfitabilityCategory>,
): Map<string, ProfitabilityCategory> {
  const next = new Map<string, ProfitabilityCategory>();

  for (const cat of categories ?? []) {
    const cached = previous.get(cat.categoryId);
    if (cached && profitabilityCategoryTotalsEqual(cached, cat)) {
      next.set(cat.categoryId, cached);
    } else {
      next.set(cat.categoryId, cat);
    }
  }

  if (next.size !== previous.size) return next;

  for (const [key, value] of next) {
    if (previous.get(key) !== value) return next;
  }

  return previous;
}
