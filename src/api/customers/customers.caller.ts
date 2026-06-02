import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateCustomerRequest } from '@/src/types/api.types';
import { customersKeys } from './customers.keys';
import { customersReq } from './customers.req';

export function useCustomersQuery() {
  return useQuery({
    queryKey: customersKeys.queries.list,
    queryFn: customersReq.list,
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: customersKeys.mutations.create,
    mutationFn: (body: CreateCustomerRequest) => customersReq.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.queries.list });
    },
  });
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: customersKeys.mutations.delete,
    mutationFn: (id: string) => customersReq.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.queries.list });
    },
  });
}
