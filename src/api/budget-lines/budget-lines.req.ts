import { apiClient } from '@/src/api/client';
import { API_ENDPOINTS } from '@/src/api/endpoints';
import {
  BudgetLine,
  BulkUpdateBudgetLinesRequest,
  CreateBudgetLineRequest,
  UpdateBudgetLineRequest,
} from '@/src/types/api.types';

export const budgetLinesReq = {
  listByBudget: (budgetId: string) =>
    apiClient
      .get<BudgetLine[]>(API_ENDPOINTS.budgetLines.listByBudget(budgetId))
      .then((r) => r.data),

  create: (body: CreateBudgetLineRequest) =>
    apiClient.post<BudgetLine>(API_ENDPOINTS.budgetLines.create, body).then((r) => r.data),

  update: (id: string, body: UpdateBudgetLineRequest) =>
    apiClient
      .put<BudgetLine>(API_ENDPOINTS.budgetLines.update(id), body)
      .then((r) => r.data),

  bulkUpdate: (body: BulkUpdateBudgetLinesRequest) =>
    apiClient
      .put<BudgetLine[]>(API_ENDPOINTS.budgetLines.bulkUpdate, body)
      .then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(API_ENDPOINTS.budgetLines.delete(id)).then(() => undefined),
};
