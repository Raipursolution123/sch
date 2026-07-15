import { apiClient } from './client';
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api';
import type {
  SyllabusStatus,
  SyllabusStatusUpdatePayload,
  SyllabusStatusCreatePayload,
} from '@/types/academics/syllabus-status';

const BASE_PATH = '/academics/syllabus-status';

export const syllabusStatusService = {
  getSyllabusStatusList: async (params?: Record<string, any>) => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<SyllabusStatus>>>(
      `${BASE_PATH}/`,
      { params },
    );
    return response.data.data;
  },

  updateSyllabusStatus: async (id: number, data: SyllabusStatusUpdatePayload) => {
    const response = await apiClient.put<{ data: SyllabusStatus; message: string }>(
      `${BASE_PATH}/${id}/`,
      data,
    );
    return response.data;
  },

  createSyllabusStatus: async (data: SyllabusStatusCreatePayload) => {
    const response = await apiClient.post<{ data: SyllabusStatus; message: string }>(
      `${BASE_PATH}/`,
      data,
    );
    return response.data;
  },

  deleteSyllabusStatus: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`${BASE_PATH}/${id}/`);
    return response.data;
  },
};
