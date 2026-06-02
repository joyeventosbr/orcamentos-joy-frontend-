import { ApiBudget, Customer, Folder } from '@/src/types/api.types';

interface UseDashboardFiltersParams {
  customers: Customer[];
  folders: Folder[];
  budgets: ApiBudget[];
  currentCustomerId: string | null;
  currentFolderId: string | null;
  searchQuery: string;
}

export function useDashboardFilters({
  customers,
  folders,
  budgets,
  currentCustomerId,
  currentFolderId,
  searchQuery,
}: UseDashboardFiltersParams) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const currentCustomer = customers.find((c) => c.id === currentCustomerId) ?? null;
  const currentFolder = folders.find((f) => f.id === currentFolderId) ?? null;

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(normalizedSearch),
  );

  const filteredFolders = folders.filter((folder) => {
    const matchesCustomer = folder.customerId === currentCustomerId;
    const matchesSearch = folder.name.toLowerCase().includes(normalizedSearch);
    return matchesCustomer && matchesSearch;
  });

  const filteredBudgets = budgets.filter((budget) => {
    const matchesFolder = budget.folderId === currentFolderId;
    const matchesSearch = budget.name.toLowerCase().includes(normalizedSearch);
    return matchesFolder && matchesSearch;
  });

  return {
    currentCustomer,
    currentFolder,
    filteredCustomers,
    filteredFolders,
    filteredBudgets,
  };
}
