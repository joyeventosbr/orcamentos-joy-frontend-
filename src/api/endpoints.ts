export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    registerAdmin: "/auth/register-admin",
    users: "/auth/users",
  },
  customers: {
    list: "/customers",
    create: "/customers",
    byId: (id: string) => `/customers/${id}`,
    update: (id: string) => `/customers/${id}`,
    delete: (id: string) => `/customers/${id}`,
  },
  folders: {
    list: "/folders",
    create: "/folders",
    byId: (id: string) => `/folders/${id}`,
    update: (id: string) => `/folders/${id}`,
    delete: (id: string) => `/folders/${id}`,
  },
  budgets: {
    list: "/budgets",
    create: "/budgets",
    byId: (id: string) => `/budgets/${id}`,
    details: (id: string) => `/budgets/${id}/details`,
    update: (id: string) => `/budgets/${id}`,
    delete: (id: string) => `/budgets/${id}`,
    export: (id: string) => `/budgets/${id}/export`,
  },
  categories: {
    list: "/categories",
    create: "/categories",
    byId: (id: string) => `/categories/${id}`,
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
  },
  budgetLines: {
    listByBudget: (budgetId: string) => `/budget-lines/budget/${budgetId}`,
    create: "/budget-lines",
    byId: (id: string) => `/budget-lines/${id}`,
    update: (id: string) => `/budget-lines/${id}`,
    bulkUpdate: "/budget-lines/bulk",
    delete: (id: string) => `/budget-lines/${id}`,
  },
  nf: {
    taxConfig: "/settings/tax",
  },
} as const;
