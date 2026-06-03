import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthUser, JwtPayload } from '@/src/types/auth.types';
import { UserRole } from '@/src/types/auth.types';

interface AuthState {
  currentUser: AuthUser | null;
  accessToken: string | null;
  tokenExpiresAt: number | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

function decodeExpiry(token: string): number | null {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function isExpired(tokenExpiresAt: number | null, token: string | null): boolean {
  if (!token) return true;
  // tokenExpiresAt pode ser null em estados persistidos antes desta versão
  if (tokenExpiresAt !== null) return Date.now() >= tokenExpiresAt;
  // fallback: decodifica apenas se não temos o valor cacheado
  const exp = decodeExpiry(token);
  return exp === null || Date.now() >= exp;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        currentUser: null,
        accessToken: null,
        tokenExpiresAt: null,

        setAuth: (accessToken, currentUser) => {
          const tokenExpiresAt = decodeExpiry(accessToken);
          set({ accessToken, currentUser, tokenExpiresAt });
        },

        clearAuth: () => set({ currentUser: null, accessToken: null, tokenExpiresAt: null }),
      }),
      {
        name: 'joy:auth',
        partialize: (state) => ({
          currentUser: state.currentUser,
          accessToken: state.accessToken,
          tokenExpiresAt: state.tokenExpiresAt,
        }),
        onRehydrateStorage: () => (state) => {
          if (!state?.accessToken) return;
          if (isExpired(state.tokenExpiresAt, state.accessToken)) {
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
  const { accessToken, tokenExpiresAt, clearAuth } = useAuthStore.getState();
  if (isExpired(tokenExpiresAt, accessToken)) {
    clearAuth();
    return null;
  }
  return accessToken;
}
