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

export type SpreadsheetNavDirection = "forward" | "backward" | "down";

export interface SpreadsheetNavContext {
  isLocked: boolean;
  isBillingTypeLocked: boolean;
}

export function isBudgetFieldEditable(
  item: BudgetItem,
  field: keyof BudgetItem,
  ctx: SpreadsheetNavContext,
): boolean {
  if (ctx.isLocked) return false;
  if (!BUDGET_ITEM_NAV_FIELDS.includes(field)) return false;
  if (field === "billingType" && ctx.isBillingTypeLocked) return false;
  return true;
}

function findItemIndex(items: BudgetItem[], itemId: string): number {
  return items.findIndex((item) => item.id === itemId);
}

function stepPosition(
  itemIndex: number,
  fieldIndex: number,
  itemsLength: number,
  direction: SpreadsheetNavDirection,
): { itemIndex: number; fieldIndex: number } | null {
  if (direction === "forward") {
    if (fieldIndex < BUDGET_ITEM_NAV_FIELDS.length - 1) {
      return { itemIndex, fieldIndex: fieldIndex + 1 };
    }
    if (itemIndex < itemsLength - 1) {
      return { itemIndex: itemIndex + 1, fieldIndex: 0 };
    }
    return null;
  }

  if (direction === "backward") {
    if (fieldIndex > 0) {
      return { itemIndex, fieldIndex: fieldIndex - 1 };
    }
    if (itemIndex > 0) {
      return { itemIndex: itemIndex - 1, fieldIndex: BUDGET_ITEM_NAV_FIELDS.length - 1 };
    }
    return null;
  }

  if (itemIndex < itemsLength - 1) {
    return { itemIndex: itemIndex + 1, fieldIndex };
  }

  return null;
}

export function getNextSpreadsheetCell(
  items: BudgetItem[],
  itemId: string,
  field: keyof BudgetItem,
  ctx: SpreadsheetNavContext,
  direction: SpreadsheetNavDirection,
): { id: string; field: keyof BudgetItem } | null {
  const startItemIndex = findItemIndex(items, itemId);
  const startFieldIndex = BUDGET_ITEM_NAV_FIELDS.indexOf(field);
  if (startItemIndex === -1 || startFieldIndex === -1) return null;

  const maxSteps = items.length * BUDGET_ITEM_NAV_FIELDS.length;
  let itemIndex = startItemIndex;
  let fieldIndex = startFieldIndex;

  for (let step = 0; step < maxSteps; step += 1) {
    const next = stepPosition(itemIndex, fieldIndex, items.length, direction);
    if (!next) return null;

    itemIndex = next.itemIndex;
    fieldIndex = next.fieldIndex;

    const item = items[itemIndex];
    const nextField = BUDGET_ITEM_NAV_FIELDS[fieldIndex];
    if (isBudgetFieldEditable(item, nextField, ctx)) {
      return { id: item.id, field: nextField };
    }
  }

  return null;
}

export function getNextTabCell(
  items: BudgetItem[],
  itemId: string,
  field: keyof BudgetItem,
  ctx: SpreadsheetNavContext,
): { id: string; field: keyof BudgetItem } | null {
  return getNextSpreadsheetCell(items, itemId, field, ctx, "forward");
}

export function getPreviousTabCell(
  items: BudgetItem[],
  itemId: string,
  field: keyof BudgetItem,
  ctx: SpreadsheetNavContext,
): { id: string; field: keyof BudgetItem } | null {
  return getNextSpreadsheetCell(items, itemId, field, ctx, "backward");
}

export function getNextEnterCell(
  items: BudgetItem[],
  itemId: string,
  field: keyof BudgetItem,
  ctx: SpreadsheetNavContext,
): { id: string; field: keyof BudgetItem } | null {
  return getNextSpreadsheetCell(items, itemId, field, ctx, "down");
}

export function isQuantityOrDaysMissing(item: BudgetItem): boolean {
  return !item.quantity || !item.days;
}
