import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  EnrollExamStudentsPayload,
  EnrollExamStudentsResult,
  ExamEnrollmentRoster,
} from '@app-types/examinations/exam-enrollment';

export const examEnrollmentsService = {
  getRoster: async (
    examId: number,
    classId: number,
    sectionId: number,
  ): Promise<ExamEnrollmentRoster> => {
    const { data } = await apiClient.get<ApiSuccessResponse<ExamEnrollmentRoster>>(
      API_ENDPOINTS.examinations.enrollmentsRoster,
      {
        params: {
          exam_id: examId,
          class_id: classId,
          section_id: sectionId,
        },
      },
    );
    return data.data;
  },

  enroll: async (payload: EnrollExamStudentsPayload): Promise<EnrollExamStudentsResult> => {
    const { data } = await apiClient.post<ApiSuccessResponse<EnrollExamStudentsResult>>(
      API_ENDPOINTS.examinations.enrollments,
      payload,
    );
    return data.data;
  },

  unenroll: async (enrollmentId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.enrollmentDetail(enrollmentId));
  },
};
