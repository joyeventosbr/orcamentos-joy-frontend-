import { BudgetItem, isInternalServiceCategory } from "@/src/types";

const createId = (prefix: string) => `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function createBudgetItem(
  categoryId: string,
  itemNumber: string,
  overrides: Partial<BudgetItem> = {},
): BudgetItem {
  return {
    id: createId("i"),
    categoryId,
    itemNumber,
    name: "",
    description: "",
    billingType: isInternalServiceCategory(categoryId) ? "VIA NF" : "",
    quantity: 1,
    days: 1,
    unitPrice: 0,
    total: 0,
    paymentAdvance: 0,
    payment30d: 0,
    payment45d: 0,
    payment60d: 0,
    payment90d: 0,
    payment120d: 0,
    fornecedorName: "",
    fornecedorValue: 0,
    percentBV: 0,
    percentNfBV: undefined,
    percentNfOver: 0,
    nfReceived: false,
    ...overrides,
  };
}

export function recalculateBudgetTotal(items: BudgetItem[]) {
  return items.reduce((sum, item) => sum + item.total, 0);
}

export function recalculateBudgetItemTotal(item: BudgetItem): BudgetItem {
  return {
    ...item,
    total: Number(item.quantity) * Number(item.days) * Number(item.unitPrice),
  };
}

