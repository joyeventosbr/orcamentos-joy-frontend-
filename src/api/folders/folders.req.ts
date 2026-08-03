import { apiClient } from '@/src/api/client';
import { API_ENDPOINTS } from '@/src/api/endpoints';
import { CreateFolderRequest, Folder, UpdateFolderRequest } from '@/src/types/api.types';

export const foldersReq = {
  list: () =>
    apiClient.get<Folder[]>(API_ENDPOINTS.folders.list).then((r) => r.data),

  create: (body: CreateFolderRequest) =>
    apiClient.post<Folder>(API_ENDPOINTS.folders.create, body).then((r) => r.data),

  update: (id: string, body: UpdateFolderRequest) =>
    apiClient.put<Folder>(API_ENDPOINTS.folders.update(id), body).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(API_ENDPOINTS.folders.delete(id)).then(() => undefined),
};
