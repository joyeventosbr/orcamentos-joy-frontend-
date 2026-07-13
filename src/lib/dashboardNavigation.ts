import { getBudgetFolderTab } from "@/src/lib/budgetStatus";
import { BudgetFolder } from "@/src/types";
import { BudgetStatus } from "@/src/types/api.types";

export interface DashboardReturnState {
  customerId: string;
  folderId: string;
  budgetFolderTab: BudgetFolder;
}

export function buildDashboardReturnState(input: {
  customerId: string;
  folderId: string;
  budgetFolderTab?: BudgetFolder;
  status?: BudgetStatus;
}): DashboardReturnState {
  return {
    customerId: input.customerId,
    folderId: input.folderId,
    budgetFolderTab: input.budgetFolderTab ?? (input.status != null ? getBudgetFolderTab(input.status) : "concorrencia"),
  };
}
