import { apiClient } from '@/src/api/client';
import { API_ENDPOINTS } from '@/src/api/endpoints';
import { CreateCustomerRequest, Customer, UpdateCustomerRequest } from '@/src/types/api.types';

export const customersReq = {
  list: () =>
    apiClient.get<Customer[]>(API_ENDPOINTS.customers.list).then((r) => r.data),

  create: (body: CreateCustomerRequest) =>
    apiClient.post<Customer>(API_ENDPOINTS.customers.create, body).then((r) => r.data),

  update: (id: string, body: UpdateCustomerRequest) =>
    apiClient.put<Customer>(API_ENDPOINTS.customers.update(id), body).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(API_ENDPOINTS.customers.delete(id)).then(() => undefined),
};
