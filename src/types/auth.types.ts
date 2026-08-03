export enum UserRole {
  CUSTOMER = 1,
  ADMIN = 2,
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  funcao?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  roleDescription: string;
}

export interface RegisterAdminRequest {
  name: string;
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  roleDescription?: string;
  iat?: number;
  exp?: number;
}

export interface ApiErrorBody {
  error?: string;
  statusCode?: number;
  message?: string | string[];
}
