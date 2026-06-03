import { Budget } from "@/src/types";
import { ApiBudget, BudgetStatus } from "@/src/types/api.types";

export const BUDGET_STATUS_LABEL: Record<BudgetStatus, string> = {
  [BudgetStatus.Concorrencia]: "Concorrência",
  [BudgetStatus.AprovadoConcorrencia]: "Aprovado Concorrência",
  [BudgetStatus.Producao]: "Produção",
  [BudgetStatus.AprovadoProducao]: "Aprovado Produção",
};

export type BudgetFolderTab = "concorrencia" | "aprovados" | "producao";

export function getBudgetFolderTab(status: BudgetStatus): BudgetFolderTab {
  if (status === BudgetStatus.AprovadoConcorrencia || status === BudgetStatus.AprovadoProducao) {
    return "aprovados";
  }
  if (status === BudgetStatus.Producao) return "producao";
  return "concorrencia";
}

export function getBudgetRootId(budget: Pick<ApiBudget, "id" | "parentId">): string {
  return budget.parentId ?? budget.id;
}

export function canApproveBudget(status: BudgetStatus): boolean {
  return status === BudgetStatus.Concorrencia || status === BudgetStatus.Producao;
}

export function canDuplicateBudget(status: BudgetStatus): boolean {
  return status !== BudgetStatus.AprovadoConcorrencia && status !== BudgetStatus.AprovadoProducao;
}

export function canDeleteBudget(budget: Pick<ApiBudget, "version" | "parentId" | "isDeletable">): boolean {
  return budget.version === 0 && budget.parentId === null && budget.isDeletable;
}

/** Badge de versão só em cópias oficiais de aprovação (vN no nome vem do backend ao aprovar). */
export function shouldShowBudgetVersion(budget: Pick<ApiBudget, "version" | "parentId">): boolean {
  return budget.parentId !== null && budget.version >= 1;
}

export function getStatusBadgeVariant(status: BudgetStatus): "default" | "success" | "warning" | "neutral" {
  switch (status) {
    case BudgetStatus.AprovadoConcorrencia:
    case BudgetStatus.AprovadoProducao:
      return "success";
    case BudgetStatus.Producao:
      return "warning";
    case BudgetStatus.Concorrencia:
    default:
      return "neutral";
  }
}

export function getBudgetDisplayStatus(budget: Pick<Budget, "status">): string {
  return BUDGET_STATUS_LABEL[budget.status];
}

export function getBudgetFolderFromStatus(status: BudgetStatus): BudgetFolderTab {
  return getBudgetFolderTab(status);
}
