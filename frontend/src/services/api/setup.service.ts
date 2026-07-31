import { apiClient } from './client';
import type {
  ComplaintType,
  CreateComplaintTypePayload,
  UpdateComplaintTypePayload,
  Source,
  CreateSourcePayload,
  UpdateSourcePayload,
  Reference,
  CreateReferencePayload,
  UpdateReferencePayload,
} from '@app-types/front-office/setup';
import { type BackendPayload, extractList } from '@utils/api-response';

export const setupFrontOfficeService = {
  // Complaint Types
  getComplaintTypes: async () => {
    const { data } = await apiClient.get<BackendPayload>('/front-office/complaint-types/');
    return extractList<ComplaintType>(data);
  },
  createComplaintType: async (data: CreateComplaintTypePayload) => {
    const response = await apiClient.post<{ data: ComplaintType; message: string }>(
      '/front-office/complaint-types/',
      data,
    );
    return response.data.data;
  },
  updateComplaintType: async (id: number, data: UpdateComplaintTypePayload) => {
    const response = await apiClient.put<{ data: ComplaintType; message: string }>(
      `/front-office/complaint-types/${id}/`,
      data,
    );
    return response.data.data;
  },
  deleteComplaintType: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(
      `/front-office/complaint-types/${id}/`,
    );
    return response.data;
  },

  // Sources
  getSources: async () => {
    const { data } = await apiClient.get<BackendPayload>('/settings/sources/');
    return extractList<Source>(data);
  },
  createSource: async (data: CreateSourcePayload) => {
    const response = await apiClient.post<{ data: Source; message: string }>(
      '/settings/sources/',
      data,
    );
    return response.data.data;
  },
  updateSource: async (id: number, data: UpdateSourcePayload) => {
    const response = await apiClient.put<{ data: Source; message: string }>(
      `/settings/sources/${id}/`,
      data,
    );
    return response.data.data;
  },
  deleteSource: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`/settings/sources/${id}/`);
    return response.data;
  },

  getReferences: async () => {
    const { data } = await apiClient.get<BackendPayload>('/settings/references/');
    return extractList<Reference>(data);
  },
  createReference: async (data: CreateReferencePayload) => {
    const response = await apiClient.post<{ data: Reference; message: string }>(
      '/settings/references/',
      data,
    );
    return response.data.data;
  },
  updateReference: async (id: number, data: UpdateReferencePayload) => {
    const response = await apiClient.put<{ data: Reference; message: string }>(
      `/settings/references/${id}/`,
      data,
    );
    return response.data.data;
  },
  deleteReference: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`/settings/references/${id}/`);
    return response.data;
  },
};
