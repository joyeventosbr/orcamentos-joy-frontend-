import { Budget, BudgetEditor, Project } from "@/src/types";
import { mockBudgets, mockProjects } from "@/src/data/mockData";
import { createBudget, createDuplicatedBudget } from "@/src/lib/budgetFactory";
import { simulateRequest } from "@/src/services/mockApiClient";

interface AppDataSnapshot {
  projects: Project[];
  budgets: Budget[];
}

interface CreateBudgetInput {
  projectId: string;
  name: string;
}

const mockDb: AppDataSnapshot = {
  projects: [...mockProjects],
  budgets: [...mockBudgets],
};

export const budgetService = {
  async getInitialData(): Promise<AppDataSnapshot> {
    return simulateRequest(mockDb);
  },

  async createProject(name: string): Promise<Project> {
    const project: Project = {
      id: `p${Date.now()}`,
      name,
      updatedAt: new Date().toISOString(),
    };

    mockDb.projects = [...mockDb.projects, project];

    return simulateRequest(project);
  },

  async deleteProject(id: string): Promise<void> {
    mockDb.projects = mockDb.projects.filter((project) => project.id !== id);
    mockDb.budgets = mockDb.budgets.filter((budget) => budget.projectId !== id);

    return simulateRequest(undefined);
  },

  async createBudget(input: CreateBudgetInput): Promise<Budget> {
    const budget = createBudget(input);

    mockDb.budgets = [...mockDb.budgets, budget];

    return simulateRequest(budget);
  },

  async updateBudget(id: string, updatedBudget: Budget, editor?: BudgetEditor): Promise<Budget> {
    const budgetWithTimestamp = {
      ...updatedBudget,
      lastUpdated: new Date().toISOString(),
      ...(editor ? { lastEditedBy: editor } : {}),
    };

    mockDb.budgets = mockDb.budgets.map((budget) =>
      budget.id === id ? budgetWithTimestamp : budget,
    );

    return simulateRequest(budgetWithTimestamp);
  },

  async deleteBudget(id: string): Promise<void> {
    mockDb.budgets = mockDb.budgets.filter((budget) => budget.id !== id);

    return simulateRequest(undefined);
  },

  async duplicateBudget(id: string): Promise<Budget | null> {
    const budget = mockDb.budgets.find((item) => item.id === id);

    if (!budget) return simulateRequest(null);

    const duplicatedBudget = createDuplicatedBudget(budget, mockDb.budgets);
    mockDb.budgets = [...mockDb.budgets, duplicatedBudget];

    return simulateRequest(duplicatedBudget);
  },
};
