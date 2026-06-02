import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthUser, JwtPayload } from '@/src/types/auth.types';
import { UserRole } from '@/src/types/auth.types';

interface AuthState {
  currentUser: AuthUser | null;
  accessToken: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        currentUser: null,
        accessToken: null,

        setAuth: (accessToken, currentUser) => set({ accessToken, currentUser }),

        clearAuth: () => set({ currentUser: null, accessToken: null }),
      }),
      {
        name: 'joy:auth',
        partialize: (state) => ({
          currentUser: state.currentUser,
          accessToken: state.accessToken,
        }),
        onRehydrateStorage: () => (state) => {
          if (!state?.accessToken) return;

          if (isTokenExpired(state.accessToken)) {
            state.clearAuth();
          }
        },
      },
    ),
    { name: 'AuthStore', enabled: import.meta.env.DEV },
  ),
);

export const selectCurrentUser = (s: AuthState) => s.currentUser;
export const selectIsAdmin = (s: AuthState) => s.currentUser?.role === UserRole.ADMIN;
export const selectIsAuthenticated = (s: AuthState) => s.currentUser !== null && s.accessToken !== null;
export const selectAccessToken = (s: AuthState) => s.accessToken;

export function getValidToken(): string | null {
  const token = useAuthStore.getState().accessToken;
  if (!token || isTokenExpired(token)) {
    useAuthStore.getState().clearAuth();
    return null;
  }
  return token;
}
