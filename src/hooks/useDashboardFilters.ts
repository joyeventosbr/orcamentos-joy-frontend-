import { Budget, BudgetFolder, Client, Job, getBudgetFolder } from "@/src/types";

interface UseDashboardFiltersParams {
  clients: Client[];
  jobs: Job[];
  budgets: Budget[];
  currentClientId: string | null;
  currentJobId: string | null;
  activeFolder: BudgetFolder;
  searchQuery: string;
}

export function useDashboardFilters({
  clients,
  jobs,
  budgets,
  currentClientId,
  currentJobId,
  activeFolder,
  searchQuery,
}: UseDashboardFiltersParams) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const currentClient =
    clients.find((c) => c.id === currentClientId) ?? null;

  const currentJob =
    jobs.find((j) => j.id === currentJobId) ?? null;

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(normalizedSearch),
  );

  const filteredJobs = jobs.filter((job) => {
    const matchesClient = job.clientId === currentClientId;
    const matchesSearch = job.name.toLowerCase().includes(normalizedSearch);
    return matchesClient && matchesSearch;
  });

  const filteredBudgets = budgets.filter((budget) => {
    const matchesJob = budget.jobId === currentJobId;
    const matchesFolder = getBudgetFolder(budget) === activeFolder;
    const matchesSearch = budget.name.toLowerCase().includes(normalizedSearch);
    return matchesJob && matchesFolder && matchesSearch;
  });

  return {
    currentClient,
    currentJob,
    filteredClients,
    filteredJobs,
    filteredBudgets,
  };
}
