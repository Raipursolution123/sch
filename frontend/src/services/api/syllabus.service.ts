import { apiClient } from './client';
import type { ApiSuccessResponse, PaginatedResponse } from '@app-types/api';
import type {
  SubjectSyllabus,
  CreateSubjectSyllabusPayload,
  UpdateSubjectSyllabusPayload,
} from '@app-types/academics/syllabus';

const BASE_PATH = '/academics/syllabus';

export const syllabusService = {
  getSyllabusList: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<SubjectSyllabus>>>(
      `${BASE_PATH}/`,
      { params },
    );
    return response.data.data;
  },

  createSyllabus: async (data: CreateSubjectSyllabusPayload) => {
    const response = await apiClient.post<ApiSuccessResponse<SubjectSyllabus>>(
      `${BASE_PATH}/`,
      data,
    );
    return response.data.data;
  },

  updateSyllabus: async (id: number, data: UpdateSubjectSyllabusPayload) => {
    const response = await apiClient.put<ApiSuccessResponse<SubjectSyllabus>>(
      `${BASE_PATH}/${id}/`,
      data,
    );
    return response.data.data;
  },

  deleteSyllabus: async (id: number) => {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(`${BASE_PATH}/${id}/`);
    return response.data;
  },
};
