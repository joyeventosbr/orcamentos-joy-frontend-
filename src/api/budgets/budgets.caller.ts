import { createCrudCallers } from '@/src/api/createCrudCallers';
import { ApiBudget, CreateBudgetRequest } from '@/src/types/api.types';
import { budgetsKeys } from './budgets.keys';
import { budgetsReq } from './budgets.req';

const callers = createCrudCallers<ApiBudget, CreateBudgetRequest>(budgetsKeys, budgetsReq);

export const useBudgetsQuery = callers.useListQuery;
export const useCreateBudgetMutation = callers.useCreateMutation;
export const useDeleteBudgetMutation = callers.useDeleteMutation;
