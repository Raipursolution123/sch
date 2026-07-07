import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse, PaginatedResponse } from '@app-types/api';
import type {
  CreateExamGroupPayload,
  ExamGroup,
  UpdateExamGroupPayload,
} from '@app-types/examinations/exam-group';

export const examGroupsService = {
  list: async (): Promise<PaginatedResponse<ExamGroup>> => {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResponse<ExamGroup>>>(
      API_ENDPOINTS.examinations.groups,
    );
    return data.data;
  },

  create: async (payload: CreateExamGroupPayload): Promise<ExamGroup> => {
    const { data } = await apiClient.post<ApiSuccessResponse<ExamGroup>>(
      API_ENDPOINTS.examinations.groups,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateExamGroupPayload): Promise<ExamGroup> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<ExamGroup>>(
      API_ENDPOINTS.examinations.groupDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.groupDetail(id));
  },
};
