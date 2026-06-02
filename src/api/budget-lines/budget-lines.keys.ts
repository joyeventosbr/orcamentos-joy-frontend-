export const budgetLinesKeys = {
  queries: {
    listByBudget: (budgetId: string) => ['budget-lines', 'budget', budgetId] as const,
  },
  mutations: {
    create: ['budget-lines', 'create'] as const,
    update: ['budget-lines', 'update'] as const,
    bulkUpdate: ['budget-lines', 'bulk-update'] as const,
    delete: ['budget-lines', 'delete'] as const,
  },
} as const;
