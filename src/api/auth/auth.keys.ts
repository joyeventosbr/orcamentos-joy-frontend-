export const authKeys = {
  queries: {
    users: ['auth', 'users'] as const,
  },
  mutations: {
    login: ['auth', 'login'] as const,
    registerUser: ['auth', 'register-user'] as const,
    registerAdmin: ['auth', 'register-admin'] as const,
    deleteUser: ['auth', 'delete-user'] as const,
  },
} as const;
