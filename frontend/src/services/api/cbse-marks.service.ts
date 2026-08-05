import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CbseMarksheet,
  CbseMarksRoster,
  CbseMarksSavePayload,
  CbseTimetableSubject,
} from '@app-types/examinations/cbse-marks';

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const cbseMarksService = {
  listTimetable: async (examId: number): Promise<CbseTimetableSubject[]> => {
    const { data } = await apiClient.get<ApiSuccessResponse<CbseTimetableSubject[]>>(
      API_ENDPOINTS.examinations.cbseExamTimetable(examId),
    );
    return data.data;
  },

  getRoster: async (
    examId: number,
    timetableId: number,
    assessmentTypeId?: number | null,
  ): Promise<CbseMarksRoster> => {
    const { data } = await apiClient.get<ApiSuccessResponse<CbseMarksRoster>>(
      `${API_ENDPOINTS.examinations.cbseMarksRoster}${buildQuery({
        cbse_exam_id: examId,
        timetable_id: timetableId,
        assessment_type_id: assessmentTypeId ?? undefined,
      })}`,
    );
    return data.data;
  },

  saveMarks: async (payload: CbseMarksSavePayload): Promise<CbseMarksRoster> => {
    const { data } = await apiClient.post<ApiSuccessResponse<CbseMarksRoster>>(
      API_ENDPOINTS.examinations.cbseMarks,
      payload,
    );
    return data.data;
  },

  getMarksheet: async (
    examId: number,
    opts: { cbseExamStudentId?: number; studentSessionId?: number },
  ): Promise<CbseMarksheet> => {
    const { data } = await apiClient.get<ApiSuccessResponse<CbseMarksheet>>(
      `${API_ENDPOINTS.examinations.cbseMarksheet}${buildQuery({
        cbse_exam_id: examId,
        cbse_exam_student_id: opts.cbseExamStudentId,
        student_session_id: opts.studentSessionId,
      })}`,
    );
    return data.data;
  },
};
