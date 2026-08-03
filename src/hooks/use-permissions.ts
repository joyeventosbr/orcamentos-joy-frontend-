import { useAuthStore } from '@/src/store/auth.store';
import { UserRole } from '@/src/types/auth.types';

export interface Permissions {
  isAdmin: boolean;
  isAuthenticated: boolean;
  canManageUsers: boolean;
  canViewEditHistory: boolean;
  canConfigureTax: boolean;
  canDeleteCustomers: boolean;
  canDeleteFolders: boolean;
}

export function usePermissions(): Permissions {
  const user = useAuthStore((s) => s.currentUser);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isAuthenticated = user !== null;

  return {
    isAdmin,
    isAuthenticated,
    canManageUsers: isAdmin,
    canViewEditHistory: isAdmin,
    canConfigureTax: isAdmin,
    canDeleteCustomers: isAdmin,
    canDeleteFolders: isAdmin,
  };
}
