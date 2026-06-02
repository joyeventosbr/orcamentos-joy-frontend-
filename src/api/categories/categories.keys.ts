export const categoriesKeys = {
  queries: {
    list: ['categories', 'list'] as const,
  },
  mutations: {
    create: ['categories', 'create'] as const,
    update: ['categories', 'update'] as const,
    delete: ['categories', 'delete'] as const,
  },
} as const;
