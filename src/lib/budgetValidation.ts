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
