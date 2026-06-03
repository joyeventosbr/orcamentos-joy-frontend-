import { BudgetItem } from "@/src/types";

/** Mantém a mesma referência de array por categoria quando os itens não mudaram. */
export function buildStableGroupedItems(
  budgetItems: BudgetItem[],
  previous: Record<string, BudgetItem[]>,
): Record<string, BudgetItem[]> {
  const byCategory = new Map<string, BudgetItem[]>();

  for (const item of budgetItems) {
    const list = byCategory.get(item.categoryId);
    if (list) {
      list.push(item);
    } else {
      byCategory.set(item.categoryId, [item]);
    }
  }

  const groups: Record<string, BudgetItem[]> = {};
  for (const [categoryId, items] of byCategory) {
    const prevItems = previous[categoryId];
    if (
      prevItems &&
      prevItems.length === items.length &&
      prevItems.every((prevItem, index) => prevItem === items[index])
    ) {
      groups[categoryId] = prevItems;
    } else {
      groups[categoryId] = items;
    }
  }

  return groups;
}
