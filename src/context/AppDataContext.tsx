import { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiBudget, Customer, Folder } from '@/src/types/api.types';
import { customersKeys } from '@/src/api/customers/customers.keys';
import { customersReq } from '@/src/api/customers/customers.req';
import { foldersKeys } from '@/src/api/folders/folders.keys';
import { foldersReq } from '@/src/api/folders/folders.req';
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
  deleteBudget: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: customersKeys.queries.list,
    queryFn: customersReq.list,
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: foldersKeys.queries.list,
    queryFn: foldersReq.list,
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: budgetsKeys.queries.list,
    queryFn: budgetsReq.list,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetsKeys.queries.list }),
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: budgetsReq.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetsKeys.queries.list }),
  });

  const addCustomer = (name: string) =>
    createCustomerMutation.mutateAsync({ name });

  const deleteCustomer = (id: string) =>
    deleteCustomerMutation.mutateAsync(id);

  const addFolder = (customerId: string, name: string) =>
    createFolderMutation.mutateAsync({ customerId, name });

  const deleteFolder = (id: string) =>
    deleteFolderMutation.mutateAsync(id);

  const addBudget = (input: { folderId: string; customerId: string; name: string }) =>
    createBudgetMutation.mutateAsync(input);

  const deleteBudget = (id: string) =>
    deleteBudgetMutation.mutateAsync(id);

  return (
    <AppDataContext.Provider value={{
      customers,
      folders,
      budgets,
      isLoading,
      addCustomer,
      deleteCustomer,
      addFolder,
      deleteFolder,
      addBudget,
      deleteBudget,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a AppDataProvider');
  }
  return context;
}
