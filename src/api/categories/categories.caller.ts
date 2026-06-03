import { createCrudCallers } from '@/src/api/createCrudCallers';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/src/types/api.types';
import { categoriesKeys } from './categories.keys';
import { categoriesReq } from './categories.req';

const callers = createCrudCallers<Category, CreateCategoryRequest, UpdateCategoryRequest>(
  categoriesKeys,
  categoriesReq,
);

export const useCategoriesQuery = callers.useListQuery;
export const useCreateCategoryMutation = callers.useCreateMutation;
export const useUpdateCategoryMutation = callers.useUpdateMutation;
export const useDeleteCategoryMutation = callers.useDeleteMutation;
