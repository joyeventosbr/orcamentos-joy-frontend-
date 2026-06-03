export const settingsKeys = {
  queries: {
    taxNf: ["settings", "TAX_NF"] as const,
  },
  mutations: {
    updateTaxNf: ["settings", "TAX_NF", "update"] as const,
  },
} as const;
