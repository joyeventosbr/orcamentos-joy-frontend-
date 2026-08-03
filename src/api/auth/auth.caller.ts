import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store/auth.store';
import { RegisterAdminRequest, RegisterUserRequest } from '@/src/types/auth.types';
import { authKeys } from './auth.keys';
import { authReq } from './auth.req';

export function useLoginMutation() {
  return useMutation({
    mutationKey: authKeys.mutations.login,
    mutationFn: authReq.login,
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.token, data.user);
    },
  });
}

export function useListUsersQuery() {
  return useQuery({
    queryKey: authKeys.queries.users,
    queryFn: authReq.listUsers,
  });
}

export function useRegisterUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: authKeys.mutations.registerUser,
    mutationFn: (body: RegisterUserRequest) => authReq.registerUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.queries.users });
    },
  });
}

export function useRegisterAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: authKeys.mutations.registerAdmin,
    mutationFn: (body: RegisterAdminRequest) => authReq.registerAdmin(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.queries.users });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: authKeys.mutations.deleteUser,
    mutationFn: (id: string) => authReq.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.queries.users });
    },
  });
}
