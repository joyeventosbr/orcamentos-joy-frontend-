import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateBudgetRequest } from '@/src/types/api.types';
import { budgetsKeys } from './budgets.keys';
import { budgetsReq } from './budgets.req';

export function useBudgetsQuery() {
  return useQuery({
    queryKey: budgetsKeys.queries.list,
    queryFn: budgetsReq.list,
  });
}

export function useCreateBudgetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: budgetsKeys.mutations.create,
    mutationFn: (body: CreateBudgetRequest) => budgetsReq.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetsKeys.queries.list });
    },
  });
}

export function useDeleteBudgetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: budgetsKeys.mutations.delete,
    mutationFn: (id: string) => budgetsReq.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetsKeys.queries.list });
    },
  });
}
