import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { CreateGradePayload, Grade, UpdateGradePayload } from '@app-types/examinations/grade';
import { type BackendPayload, extractList } from '@utils/api-response';

export const gradesService = {
  list: async (): Promise<Grade[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.examinations.grades);
    return extractList<Grade>(data);
  },

  create: async (payload: CreateGradePayload): Promise<Grade> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Grade>>(
      API_ENDPOINTS.examinations.grades,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateGradePayload): Promise<Grade> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<Grade>>(
      API_ENDPOINTS.examinations.gradeDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.gradeDetail(id));
  },
};
