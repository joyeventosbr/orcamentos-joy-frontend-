import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/src/types/api.types';
import { categoriesKeys } from './categories.keys';
import { categoriesReq } from './categories.req';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoriesKeys.queries.list,
    queryFn: categoriesReq.list,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: categoriesKeys.mutations.create,
    mutationFn: (body: CreateCategoryRequest) => categoriesReq.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.queries.list });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: categoriesKeys.mutations.update,
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryRequest }) =>
      categoriesReq.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.queries.list });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: categoriesKeys.mutations.delete,
    mutationFn: (id: string) => categoriesReq.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.queries.list });
    },
  });
}
