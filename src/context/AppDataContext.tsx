import { createContext, useCallback, useContext, useMemo, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { selectIsAuthenticated, useAuthStore } from '@/src/store/auth.store';
import { ApiBudget, Customer, Folder } from '@/src/types/api.types';
import { customersKeys } from '@/src/api/customers/customers.keys';
import { customersReq } from '@/src/api/customers/customers.req';
import { foldersKeys } from '@/src/api/folders/folders.keys';
import { foldersReq } from '@/src/api/folders/folders.req';
import { invalidateBudgetList, removeBudgetDetailCache } from '@/src/api/budgets/budgets.cache';
import { budgetsKeys } from '@/src/api/budgets/budgets.keys';
import { budgetsReq } from '@/src/api/budgets/budgets.req';

interface AppDataContextType {
  customers: Customer[];
  folders: Folder[];
  budgets: ApiBudget[];
  isLoading: boolean;
  addCustomer: (name: string) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  addFolder: (customerId: string, name: string) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  addBudget: (input: { folderId: string; customerId: string; name: string }) => Promise<ApiBudget>;
  copyBudget: (id: string) => Promise<ApiBudget>;
  deleteBudget: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: customersKeys.queries.list,
    queryFn: customersReq.list,
    enabled: isAuthenticated,
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: foldersKeys.queries.list,
    queryFn: foldersReq.list,
    enabled: isAuthenticated,
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: budgetsKeys.queries.list,
    queryFn: budgetsReq.list,
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const isLoading = customersLoading || foldersLoading || budgetsLoading;

  const createCustomerMutation = useMutation({
    mutationFn: customersReq.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKeys.queries.list }),
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: customersReq.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKeys.queries.list }),
  });

  const createFolderMutation = useMutation({
    mutationFn: foldersReq.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foldersKeys.queries.list }),
  });

  const deleteFolderMutation = useMutation({
    mutationFn: foldersReq.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foldersKeys.queries.list }),
  });

  const createBudgetMutation = useMutation({
    mutationFn: budgetsReq.create,
    onSuccess: async () => invalidateBudgetList(queryClient),
  });

  const copyBudgetMutation = useMutation({
    mutationFn: budgetsReq.copy,
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: budgetsReq.remove,
    onSuccess: async () => invalidateBudgetList(queryClient),
  });

  const addCustomer = useCallback(
    (name: string) => createCustomerMutation.mutateAsync({ name }),
    [createCustomerMutation.mutateAsync],
  );

  const deleteCustomer = useCallback(
    (id: string) => deleteCustomerMutation.mutateAsync(id),
    [deleteCustomerMutation.mutateAsync],
  );

  const addFolder = useCallback(
    (customerId: string, name: string) => createFolderMutation.mutateAsync({ customerId, name }),
    [createFolderMutation.mutateAsync],
  );

  const deleteFolder = useCallback(
    (id: string) => deleteFolderMutation.mutateAsync(id),
    [deleteFolderMutation.mutateAsync],
  );

  const addBudget = useCallback(
    (input: { folderId: string; customerId: string; name: string }) =>
      createBudgetMutation.mutateAsync(input),
    [createBudgetMutation.mutateAsync],
  );

  const copyBudget = useCallback(
    async (id: string) => {
      const copied = await copyBudgetMutation.mutateAsync(id);
      await invalidateBudgetList(queryClient);
      return copied;
    },
    [copyBudgetMutation.mutateAsync, queryClient],
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      await deleteBudgetMutation.mutateAsync(id);
      removeBudgetDetailCache(queryClient, id);
      await invalidateBudgetList(queryClient);
    },
    [deleteBudgetMutation.mutateAsync, queryClient],
  );

  const value = useMemo<AppDataContextType>(
    () => ({
      customers,
      folders,
      budgets,
      isLoading,
      addCustomer,
      deleteCustomer,
      addFolder,
      deleteFolder,
      addBudget,
      copyBudget,
      deleteBudget,
    }),
    [
      customers, folders, budgets, isLoading,
      addCustomer, deleteCustomer,
      addFolder, deleteFolder,
      addBudget, copyBudget, deleteBudget,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a AppDataProvider');
  }
  return context;
}
