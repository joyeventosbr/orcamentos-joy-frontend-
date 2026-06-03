import { createCrudCallers } from '@/src/api/createCrudCallers';
import { CreateFolderRequest, Folder } from '@/src/types/api.types';
import { foldersKeys } from './folders.keys';
import { foldersReq } from './folders.req';

const callers = createCrudCallers<Folder, CreateFolderRequest>(foldersKeys, foldersReq);

export const useFoldersQuery = callers.useListQuery;
export const useCreateFolderMutation = callers.useCreateMutation;
export const useDeleteFolderMutation = callers.useDeleteMutation;
