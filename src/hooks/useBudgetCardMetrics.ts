import { budgetsKeys } from "@/src/api/budgets/budgets.keys";
import { budgetsReq } from "@/src/api/budgets/budgets.req";
import {
  BudgetCardMetrics,
  computeBudgetCardMetrics,
} from "@/src/lib/budgetSummaryMetrics";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export function useBudgetCardMetrics(budgetIds: string[]) {
  const detailQueries = useQueries({
    queries: budgetIds.map((budgetId) => ({
      queryKey: budgetsKeys.queries.detail(budgetId),
      queryFn: () => budgetsReq.details(budgetId),
      enabled: Boolean(budgetId),
    })),
  });

  const metricsByBudgetId = useMemo(() => {
    const map = new Map<string, BudgetCardMetrics | undefined>();

    budgetIds.forEach((budgetId, index) => {
      const detail = detailQueries[index]?.data;
      map.set(budgetId, detail ? computeBudgetCardMetrics(detail) : undefined);
    });

    return map;
  }, [budgetIds, detailQueries]);

  const isLoading = detailQueries.some((query) => query.isLoading);

  return { metricsByBudgetId, isLoading };
}
