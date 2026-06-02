import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateFolderRequest } from '@/src/types/api.types';
import { foldersKeys } from './folders.keys';
import { foldersReq } from './folders.req';

export function useFoldersQuery() {
  return useQuery({
    queryKey: foldersKeys.queries.list,
    queryFn: foldersReq.list,
  });
}

export function useCreateFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: foldersKeys.mutations.create,
    mutationFn: (body: CreateFolderRequest) => foldersReq.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foldersKeys.queries.list });
    },
  });
}

export function useDeleteFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: foldersKeys.mutations.delete,
    mutationFn: (id: string) => foldersReq.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foldersKeys.queries.list });
    },
  });
}
