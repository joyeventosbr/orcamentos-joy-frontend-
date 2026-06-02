export const budgetsKeys = {
  queries: {
    list: ['budgets', 'list'] as const,
  },
  mutations: {
    create: ['budgets', 'create'] as const,
    delete: ['budgets', 'delete'] as const,
  },
} as const;
