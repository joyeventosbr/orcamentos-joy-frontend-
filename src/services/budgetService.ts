import { Budget, BudgetEditor, Client, Job } from "@/src/types";
import { mockBudgets, mockClients, mockJobs } from "@/src/data/mockData";
import { createBudget, createDuplicatedBudget, createApprovedCopy, createProductionBudget } from "@/src/lib/budgetFactory";
import { simulateRequest } from "@/src/services/mockApiClient";

interface AppDataSnapshot {
  clients: Client[];
  jobs: Job[];
  budgets: Budget[];
}

interface CreateBudgetInput {
  jobId: string;
  name: string;
}

export interface ApprovalResult {
  approvedCopy: Budget;
  productionCopy?: Budget;
}

const mockDb: AppDataSnapshot = {
  clients: [...mockClients],
  jobs: [...mockJobs],
  budgets: [...mockBudgets],
};

export const budgetService = {
  async getInitialData(): Promise<AppDataSnapshot> {
    return simulateRequest(mockDb);
  },

  // --- Client CRUD ---

  async createClient(name: string): Promise<Client> {
    const client: Client = {
      id: `c${Date.now()}`,
      name,
      updatedAt: new Date().toISOString(),
    };
    mockDb.clients = [...mockDb.clients, client];
    return simulateRequest(client);
  },

  async deleteClient(id: string): Promise<void> {
    const jobIds = mockDb.jobs.filter((j) => j.clientId === id).map((j) => j.id);
    mockDb.clients = mockDb.clients.filter((c) => c.id !== id);
    mockDb.jobs = mockDb.jobs.filter((j) => j.clientId !== id);
    mockDb.budgets = mockDb.budgets.filter((b) => !jobIds.includes(b.jobId));
    return simulateRequest(undefined);
  },

  // --- Job CRUD ---

  async createJob(clientId: string, name: string): Promise<Job> {
    const job: Job = {
      id: `j${Date.now()}`,
      clientId,
      name,
      updatedAt: new Date().toISOString(),
    };
    mockDb.jobs = [...mockDb.jobs, job];
    return simulateRequest(job);
  },

  async deleteJob(id: string): Promise<void> {
    mockDb.jobs = mockDb.jobs.filter((j) => j.id !== id);
    mockDb.budgets = mockDb.budgets.filter((b) => b.jobId !== id);
    return simulateRequest(undefined);
  },

  // --- Budget CRUD ---

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

  // --- Approval Workflow ---

  async approveBudget(id: string): Promise<ApprovalResult> {
    const budget = mockDb.budgets.find((b) => b.id === id);
    if (!budget) throw new Error("Orçamento não encontrado.");
    if (budget.isLocked) throw new Error("Este orçamento já está aprovado e bloqueado.");

    const siblingBudgets = mockDb.budgets.filter((b) => b.jobId === budget.jobId);

    if (budget.phase === "concorrencia") {
      const existingApproved = siblingBudgets.find(
        (b) => b.status === "Aprovado" && b.phase === "concorrencia",
      );
      if (existingApproved) {
        throw new Error("Já existe um orçamento aprovado na Concorrência deste Job. Apenas 1 é permitido.");
      }
    }

    if (budget.phase === "producao") {
      const existingApproved = siblingBudgets.find(
        (b) => b.status === "Aprovado" && b.phase === "producao",
      );
      if (existingApproved) {
        throw new Error("Já existe um orçamento com Produção Aprovada neste Job. Apenas 1 é permitido.");
      }
    }

    const approvedCopy = createApprovedCopy(budget);
    mockDb.budgets = [...mockDb.budgets, approvedCopy];

    let productionCopy: Budget | undefined;

    if (budget.phase === "concorrencia") {
      productionCopy = createProductionBudget(budget);
      mockDb.budgets = [...mockDb.budgets, productionCopy];
    }

    return simulateRequest({ approvedCopy, productionCopy });
  },
};
