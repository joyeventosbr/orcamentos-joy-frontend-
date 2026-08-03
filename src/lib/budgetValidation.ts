import { Budget, BudgetItem } from "@/src/types";

import { isQuantityOrDaysMissing } from "@/src/lib/budgetSpreadsheetNavigation";

export interface IBudgetValidationResult {
  missingFields: string[];
  inconsistentItems: BudgetItem[];
  itemsMissingQtyOrDays: BudgetItem[];
}

export function validateBudget(budget: Budget): IBudgetValidationResult {
  const missingFields: string[] = [];
  if (!budget.client?.trim()) missingFields.push("Cliente");
  if (!budget.job?.trim()) missingFields.push("Job");
  if (!budget.deadline) missingFields.push("Prazo de pagamento");

  const inconsistentItems = budget.items.filter(
    (item) => (item.unitPrice > 0 || item.total > 0) && !item.billingType,
  );

  const itemsMissingQtyOrDays = budget.items.filter(isQuantityOrDaysMissing);

  return { missingFields, inconsistentItems, itemsMissingQtyOrDays };
}

/** Mensagem de erro para bloquear aprovação; null se o orçamento estiver válido. */
export function getBudgetApprovalError(result: IBudgetValidationResult): string | null {
  if (result.missingFields.length > 0) {
    return `Preencha os campos obrigatórios antes de aprovar: ${result.missingFields.join(", ")}`;
  }
  if (result.itemsMissingQtyOrDays.length > 0) {
    return `Corrija ${result.itemsMissingQtyOrDays.length} item(ns) com Qtd ou Diárias não preenchidos antes de aprovar`;
  }
  if (result.inconsistentItems.length > 0) {
    return `Corrija ${result.inconsistentItems.length} item(ns) sem tipo de faturamento antes de aprovar`;
  }
  return null;
}

/**
 * Bloqueia aprovações sem rentabilidade final positiva para usuários comuns.
 * Administradores podem prosseguir como exceção operacional.
 */
export function getProfitabilityApprovalError(
  rentabilidadeProd: number,
  isAdmin: boolean,
): string | null {
  if (isAdmin || rentabilidadeProd > 0) return null;

  return "Este orçamento não possui rentabilidade positiva. Somente um administrador pode aprová-lo.";
}
