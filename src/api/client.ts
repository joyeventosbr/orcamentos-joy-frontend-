import { API_ENDPOINTS } from "@/src/api/endpoints";
import { getValidToken, useAuthStore } from "@/src/store/auth.store";
import { ApiErrorBody } from "@/src/types/auth.types";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

function isLoginRequest(url?: string): boolean {
  return url?.includes(API_ENDPOINTS.auth.login) ?? false;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractApiError(error: AxiosError): Error {
  const data = error.response?.data as ApiErrorBody | undefined;

  const message =
    typeof data?.error === "string" && data.error !== "Unauthorized" && data.error !== "Forbidden"
      ? data.error
      : typeof data?.message === "string"
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(", ")
          : error.message;

  return new Error(message);
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;

    if (status === 401 && !isLoginRequest(requestUrl)) {
      useAuthStore.getState().clearAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(extractApiError(error));
  },
);
