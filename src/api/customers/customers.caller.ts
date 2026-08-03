import { createCrudCallers } from '@/src/api/createCrudCallers';
import { CreateCustomerRequest, Customer, UpdateCustomerRequest } from '@/src/types/api.types';
import { customersKeys } from './customers.keys';
import { customersReq } from './customers.req';

const callers = createCrudCallers<Customer, CreateCustomerRequest, UpdateCustomerRequest>(customersKeys, customersReq);

export const useCustomersQuery = callers.useListQuery;
export const useCreateCustomerMutation = callers.useCreateMutation;
export const useUpdateCustomerMutation = callers.useUpdateMutation;
export const useDeleteCustomerMutation = callers.useDeleteMutation;
