import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { CbseExam, CreateCbseExamPayload } from '@app-types/examinations/cbse-exam';
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
};
