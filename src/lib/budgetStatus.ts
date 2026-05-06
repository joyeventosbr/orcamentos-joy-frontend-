import { BudgetStatus } from "@/src/types";

export function getStatusBadgeVariant(status: BudgetStatus) {
  switch (status) {
    case "Aprovado":
      return "success";
    case "Em andamento":
      return "warning";
    case "Rascunho":
    default:
      return "neutral";
  }
}
