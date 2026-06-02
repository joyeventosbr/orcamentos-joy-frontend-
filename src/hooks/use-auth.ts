import { useAuthStore, selectCurrentUser } from '@/src/store/auth.store';

export function useAuth() {
  const currentUser = useAuthStore(selectCurrentUser);

  return {
    currentUser,
    logout: () => useAuthStore.getState().clearAuth(),
  };
}
