import { apiClient } from '@/src/api/client';
import { API_ENDPOINTS } from '@/src/api/endpoints';
import { AuthResponse, AuthUser, LoginCredentials, RegisterAdminRequest, RegisterUserRequest } from '@/src/types/auth.types';

export const authReq = {
  login: (body: LoginCredentials) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, body).then((r) => r.data),

  registerUser: (body: RegisterUserRequest) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, body).then((r) => r.data),

  registerAdmin: (body: RegisterAdminRequest) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.auth.registerAdmin, body).then((r) => r.data),

  listUsers: () =>
    apiClient.get<AuthUser[]>(API_ENDPOINTS.auth.users).then((r) => r.data),

  deleteUser: (id: string) =>
    apiClient.delete(API_ENDPOINTS.auth.deleteUser(id)).then(() => undefined),
};
