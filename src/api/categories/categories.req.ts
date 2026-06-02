import { apiClient } from '@/src/api/client';
import { API_ENDPOINTS } from '@/src/api/endpoints';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/src/types/api.types';

export const categoriesReq = {
  list: () =>
    apiClient.get<Category[]>(API_ENDPOINTS.categories.list).then((r) => r.data),

  create: (body: CreateCategoryRequest) =>
    apiClient.post<Category>(API_ENDPOINTS.categories.create, body).then((r) => r.data),

  update: (id: string, body: UpdateCategoryRequest) =>
    apiClient.put<Category>(API_ENDPOINTS.categories.update(id), body).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(API_ENDPOINTS.categories.delete(id)).then(() => undefined),
};
