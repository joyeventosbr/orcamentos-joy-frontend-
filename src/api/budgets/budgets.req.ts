import { apiClient } from "@/src/api/client";
import { API_ENDPOINTS } from "@/src/api/endpoints";
import { ApiBudget, BudgetDetail, CreateBudgetRequest, UpdateBudgetRequest } from "@/src/types/api.types";

export const budgetsReq = {
  list: () => apiClient.get<ApiBudget[]>(API_ENDPOINTS.budgets.list).then((r) => r.data),

  create: (body: CreateBudgetRequest) =>
    apiClient.post<ApiBudget>(API_ENDPOINTS.budgets.create, body).then((r) => r.data),

  details: (id: string) => apiClient.get<BudgetDetail>(API_ENDPOINTS.budgets.details(id)).then((r) => r.data),

  update: (id: string, body: UpdateBudgetRequest) =>
    apiClient.put<ApiBudget>(API_ENDPOINTS.budgets.update(id), body).then((r) => r.data),

  remove: (id: string) => apiClient.delete(API_ENDPOINTS.budgets.delete(id)).then(() => undefined),

  approve: (id: string) =>
    apiClient.patch<ApiBudget[]>(API_ENDPOINTS.budgets.approve(id)).then((r) => r.data),

  approveToProduction: (id: string) =>
    apiClient.patch<ApiBudget>(API_ENDPOINTS.budgets.approveToProduction(id)).then((r) => r.data),

  copy: (id: string) => apiClient.post<ApiBudget>(API_ENDPOINTS.budgets.copy(id)).then((r) => r.data),
};
