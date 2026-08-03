import { createCrudCallers } from '@/src/api/createCrudCallers';
import { CreateFolderRequest, Folder, UpdateFolderRequest } from '@/src/types/api.types';
import { foldersKeys } from './folders.keys';
import { foldersReq } from './folders.req';

const callers = createCrudCallers<Folder, CreateFolderRequest, UpdateFolderRequest>(foldersKeys, foldersReq);

export const useFoldersQuery = callers.useListQuery;
export const useCreateFolderMutation = callers.useCreateMutation;
export const useUpdateFolderMutation = callers.useUpdateMutation;
export const useDeleteFolderMutation = callers.useDeleteMutation;
