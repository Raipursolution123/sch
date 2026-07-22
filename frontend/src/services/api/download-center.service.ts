import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  ContentType,
  CreateContentTypePayload,
  CreateUploadContentPayload,
  UpdateContentTypePayload,
  UploadContent,
} from '@app-types/download-center';
import { type BackendPayload, extractList } from '@utils/api-response';

export const downloadCenterService = {
  listContentTypes: async (query?: string): Promise<ContentType[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.documents.contentTypes, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<ContentType>(data);
  },

  createContentType: async (payload: CreateContentTypePayload): Promise<ContentType> => {
    const { data } = await apiClient.post<ApiSuccessResponse<ContentType>>(
      API_ENDPOINTS.documents.contentTypes,
      payload,
    );
    return data.data;
  },

  updateContentType: async (
    id: number,
    payload: UpdateContentTypePayload,
  ): Promise<ContentType> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<ContentType>>(
      API_ENDPOINTS.documents.contentTypeDetail(id),
      payload,
    );
    return data.data;
  },

  deleteContentType: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.documents.contentTypeDetail(id));
  },

  listContent: async (query?: string): Promise<UploadContent[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.documents.uploadContent, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<UploadContent>(data);
  },

  createContent: async (payload: CreateUploadContentPayload): Promise<UploadContent> => {
    const { data } = await apiClient.post<ApiSuccessResponse<UploadContent>>(
      API_ENDPOINTS.documents.uploadContent,
      payload,
    );
    return data.data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.documents.uploadContentDetail(id));
  },
};
