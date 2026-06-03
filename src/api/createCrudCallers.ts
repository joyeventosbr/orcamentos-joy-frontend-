import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface CrudKeys {
  queries: { list: readonly unknown[] };
  mutations?: {
    create?: readonly unknown[];
    update?: readonly unknown[];
    delete?: readonly unknown[];
  };
}

interface CrudRequests<TItem, TCreate, TUpdate = never> {
  list: () => Promise<TItem[]>;
  create?: (body: TCreate) => Promise<TItem>;
  update?: (id: string, body: TUpdate) => Promise<TItem>;
  remove?: (id: string) => Promise<void>;
}

export function createCrudCallers<TItem, TCreate, TUpdate = never>(
  keys: CrudKeys,
  req: CrudRequests<TItem, TCreate, TUpdate>,
) {
  function useListQuery() {
    return useQuery({ queryKey: keys.queries.list, queryFn: req.list });
  }

  function useCreateMutation() {
    const qc = useQueryClient();
    return useMutation({
      mutationKey: keys.mutations?.create,
      mutationFn: req.create!,
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.queries.list }),
    });
  }

  function useUpdateMutation() {
    const qc = useQueryClient();
    return useMutation({
      mutationKey: keys.mutations?.update,
      mutationFn: ({ id, body }: { id: string; body: TUpdate }) => req.update!(id, body),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.queries.list }),
    });
  }

  function useDeleteMutation() {
    const qc = useQueryClient();
    return useMutation({
      mutationKey: keys.mutations?.delete,
      mutationFn: (id: string) => req.remove!(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.queries.list }),
    });
  }

  return { useListQuery, useCreateMutation, useUpdateMutation, useDeleteMutation };
}
