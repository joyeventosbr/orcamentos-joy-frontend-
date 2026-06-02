export const foldersKeys = {
  queries: {
    list: ['folders', 'list'] as const,
  },
  mutations: {
    create: ['folders', 'create'] as const,
    delete: ['folders', 'delete'] as const,
  },
} as const;
