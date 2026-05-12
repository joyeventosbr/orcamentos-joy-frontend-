import { Budget, BudgetStatus } from "@/src/types";

export function getStatusBadgeVariant(status: BudgetStatus | string) {
  switch (status) {
    case "Aprovado":
    case "Aprovado Concorrência":
    case "Aprovado Produção":
      return "success";
    case "Produção":
      return "warning";
    case "Concorrência":
    default:
      return "neutral";
  }
}

export function getBudgetDisplayStatus(budget: Budget): string {
  if (budget.status !== "Aprovado") return budget.status;
  return budget.phase === "concorrencia"
    ? "Aprovado Concorrência"
    : "Aprovado Produção";
}
