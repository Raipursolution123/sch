import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CbseExam,
  CreateCbseExamPayload,
  UpdateCbseExamPayload,
} from '@app-types/examinations/cbse-exam';
import { type BackendPayload, extractList } from '@utils/api-response';

export const cbseExamsService = {
  list: async (): Promise<CbseExam[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.examinations.cbseExams);
    return extractList<CbseExam>(data);
  },

  create: async (payload: CreateCbseExamPayload): Promise<CbseExam> => {
    const { data } = await apiClient.post<ApiSuccessResponse<CbseExam>>(
      API_ENDPOINTS.examinations.cbseExams,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateCbseExamPayload): Promise<CbseExam> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<CbseExam>>(
      API_ENDPOINTS.examinations.cbseExamDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.cbseExamDetail(id));
  },
};
