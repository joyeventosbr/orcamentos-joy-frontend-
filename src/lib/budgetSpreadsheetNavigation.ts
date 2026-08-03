import { BudgetItem } from "@/src/types";

/** Editable fields in left-to-right column order (read-only columns are skipped). */
export const BUDGET_ITEM_NAV_FIELDS: (keyof BudgetItem)[] = [
  "name",
  "description",
  "billingType",
  "quantity",
  "days",
  "unitPrice",
  "paymentAdvance",
  "payment30d",
  "payment45d",
  "payment60d",
  "payment90d",
  "payment120d",
  "fornecedorName",
  "fornecedorValue",
  "percentBV",
  "percentNfBV",
  "percentNfOver",
  "nfReceived",
];

export function getNextTabCell(
  items: BudgetItem[],
  itemId: string,
  field: keyof BudgetItem,
): { id: string; field: keyof BudgetItem } | null {
  const fieldIndex = BUDGET_ITEM_NAV_FIELDS.indexOf(field);
  if (fieldIndex === -1) return null;

  if (fieldIndex < BUDGET_ITEM_NAV_FIELDS.length - 1) {
    return { id: itemId, field: BUDGET_ITEM_NAV_FIELDS[fieldIndex + 1] };
  }

  const itemIndex = items.findIndex((item) => item.id === itemId);
  if (itemIndex >= 0 && itemIndex < items.length - 1) {
    return { id: items[itemIndex + 1].id, field: BUDGET_ITEM_NAV_FIELDS[0] };
  }

  return null;
}

export function isQuantityOrDaysMissing(item: BudgetItem): boolean {
  return !item.quantity || !item.days;
}
