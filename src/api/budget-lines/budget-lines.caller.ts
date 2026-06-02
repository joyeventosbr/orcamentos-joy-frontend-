import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BulkUpdateBudgetLinesRequest,
  CreateBudgetLineRequest,
  UpdateBudgetLineRequest,
} from '@/src/types/api.types';
import { budgetLinesKeys } from './budget-lines.keys';
import { budgetLinesReq } from './budget-lines.req';

export function useBudgetLinesQuery(budgetId: string | undefined) {
  return useQuery({
    queryKey: budgetLinesKeys.queries.listByBudget(budgetId!),
    queryFn: () => budgetLinesReq.listByBudget(budgetId!),
    enabled: !!budgetId,
  });
}

export function useCreateBudgetLineMutation(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: budgetLinesKeys.mutations.create,
    mutationFn: (body: CreateBudgetLineRequest) => budgetLinesReq.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetLinesKeys.queries.listByBudget(budgetId),
      });
    },
  });
}

export function useUpdateBudgetLineMutation(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: budgetLinesKeys.mutations.update,
    mutationFn: ({ id, body }: { id: string; body: UpdateBudgetLineRequest }) =>
      budgetLinesReq.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetLinesKeys.queries.listByBudget(budgetId),
      });
    },
  });
}

export function useBulkUpdateBudgetLinesMutation(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: budgetLinesKeys.mutations.bulkUpdate,
    mutationFn: (body: BulkUpdateBudgetLinesRequest) => budgetLinesReq.bulkUpdate(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetLinesKeys.queries.listByBudget(budgetId),
      });
    },
  });
}

export function useDeleteBudgetLineMutation(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: budgetLinesKeys.mutations.delete,
    mutationFn: (id: string) => budgetLinesReq.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetLinesKeys.queries.listByBudget(budgetId),
      });
    },
  });
}
