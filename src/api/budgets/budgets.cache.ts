import { budgetsKeys } from "@/src/api/budgets/budgets.keys";
import { budgetsReq } from "@/src/api/budgets/budgets.req";
import { QueryClient } from "@tanstack/react-query";

/** Lista de orçamentos — refetch mesmo com query inativa (ex.: usuário no editor). */
export async function invalidateBudgetList(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: budgetsKeys.queries.list,
    refetchType: "all",
  });
}

export async function invalidateBudgetDetail(queryClient: QueryClient, budgetId: string) {
  await queryClient.invalidateQueries({
    queryKey: budgetsKeys.queries.detail(budgetId),
    refetchType: "all",
  });
}

export async function refreshBudgetCaches(queryClient: QueryClient, budgetId?: string) {
  const tasks = [invalidateBudgetList(queryClient)];
  if (budgetId) {
    tasks.push(invalidateBudgetDetail(queryClient, budgetId));
  }
  await Promise.all(tasks);
}

export async function fetchBudgetDetailFresh(queryClient: QueryClient, budgetId: string) {
  return queryClient.fetchQuery({
    queryKey: budgetsKeys.queries.detail(budgetId),
    queryFn: () => budgetsReq.details(budgetId),
    staleTime: 0,
  });
}

export function removeBudgetDetailCache(queryClient: QueryClient, budgetId: string) {
  queryClient.removeQueries({ queryKey: budgetsKeys.queries.detail(budgetId) });
}
