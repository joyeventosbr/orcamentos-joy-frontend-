import { createCrudCallers } from '@/src/api/createCrudCallers';
import { CreateCustomerRequest, Customer } from '@/src/types/api.types';
import { customersKeys } from './customers.keys';
import { customersReq } from './customers.req';

const callers = createCrudCallers<Customer, CreateCustomerRequest>(customersKeys, customersReq);

export const useCustomersQuery = callers.useListQuery;
export const useCreateCustomerMutation = callers.useCreateMutation;
export const useDeleteCustomerMutation = callers.useDeleteMutation;
