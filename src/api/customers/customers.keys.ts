export const customersKeys = {
  queries: {
    list: ['customers', 'list'] as const,
  },
  mutations: {
    create: ['customers', 'create'] as const,
    update: ['customers', 'update'] as const,
    delete: ['customers', 'delete'] as const,
  },
} as const;
