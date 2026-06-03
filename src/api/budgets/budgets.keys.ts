export const budgetsKeys = {
  queries: {
    list: ['budgets', 'list'] as const,
    detail: (id: string) => ['budgets', 'detail', id] as const,
  },
  mutations: {
    create: ['budgets', 'create'] as const,
    update: ['budgets', 'update'] as const,
    delete: ['budgets', 'delete'] as const,
  },
} as const;
