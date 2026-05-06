import { Budget, BudgetStatus, Project } from "@/src/types";

interface UseDashboardFiltersParams {
  projects: Project[];
  budgets: Budget[];
  currentProjectId: string | null;
  searchQuery: string;
  statusFilter: BudgetStatus | "Todos";
}

export function useDashboardFilters({
  projects,
  budgets,
  currentProjectId,
  searchQuery,
  statusFilter,
}: UseDashboardFiltersParams) {
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const currentProject =
    projects.find((project) => project.id === currentProjectId) ?? null;

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(normalizedSearch),
  );

  const filteredBudgets = budgets.filter((budget) => {
    const matchesProject = budget.projectId === currentProjectId;
    const matchesSearch = budget.name.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === "Todos" || budget.status === statusFilter;

    return matchesProject && matchesSearch && matchesStatus;
  });

  return {
    currentProject,
    filteredProjects,
    filteredBudgets,
  };
}
