import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  ExamResultRoster,
  SaveExamResultsPayload,
  SaveExamResultsResult,
} from '@app-types/examinations/exam-result';

export const examResultsService = {
  getRoster: async (examId: number, scheduleId: number): Promise<ExamResultRoster> => {
    const { data } = await apiClient.get<ApiSuccessResponse<ExamResultRoster>>(
      API_ENDPOINTS.examinations.resultsRoster,
      {
        params: {
          exam_id: examId,
          schedule_id: scheduleId,
        },
      },
    );
    return data.data;
  },

  save: async (payload: SaveExamResultsPayload): Promise<SaveExamResultsResult> => {
    const { data } = await apiClient.post<ApiSuccessResponse<SaveExamResultsResult>>(
      API_ENDPOINTS.examinations.results,
      payload,
    );
    return data.data;
  },
};
