import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  AddExamQuestionsPayload,
  CreateOnlineExamPayload,
  CreateQuestionPayload,
  OnlineExam,
  OnlineExamQuestionLink,
  OnlineExamRoster,
  QuestionBankItem,
  UpdateOnlineExamPayload,
  UpdateQuestionPayload,
} from '@app-types/examinations/online-exams';
import { type BackendPayload, extractList } from '@utils/api-response';

export const onlineExamsService = {
  listQuestions: async (query?: string): Promise<QuestionBankItem[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.examinations.questions, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<QuestionBankItem>(data);
  },

  createQuestion: async (payload: CreateQuestionPayload): Promise<QuestionBankItem> => {
    const { data } = await apiClient.post<ApiSuccessResponse<QuestionBankItem>>(
      API_ENDPOINTS.examinations.questions,
      payload,
    );
    return data.data;
  },

  updateQuestion: async (id: number, payload: UpdateQuestionPayload): Promise<QuestionBankItem> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<QuestionBankItem>>(
      API_ENDPOINTS.examinations.questionDetail(id),
      payload,
    );
    return data.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.questionDetail(id));
  },

  listExams: async (query?: string): Promise<OnlineExam[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.examinations.onlineExams, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<OnlineExam>(data);
  },

  createExam: async (payload: CreateOnlineExamPayload): Promise<OnlineExam> => {
    const { data } = await apiClient.post<ApiSuccessResponse<OnlineExam>>(
      API_ENDPOINTS.examinations.onlineExams,
      payload,
    );
    return data.data;
  },

  updateExam: async (id: number, payload: UpdateOnlineExamPayload): Promise<OnlineExam> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<OnlineExam>>(
      API_ENDPOINTS.examinations.onlineExamDetail(id),
      payload,
    );
    return data.data;
  },

  deleteExam: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.onlineExamDetail(id));
  },

  listExamQuestions: async (examId: number): Promise<OnlineExamQuestionLink[]> => {
    const { data } = await apiClient.get<ApiSuccessResponse<OnlineExamQuestionLink[]>>(
      API_ENDPOINTS.examinations.onlineExamQuestions(examId),
    );
    return data.data;
  },

  addExamQuestions: async (
    examId: number,
    payload: AddExamQuestionsPayload,
  ): Promise<{ created: number; skipped: number }> => {
    const { data } = await apiClient.post<ApiSuccessResponse<{ created: number; skipped: number }>>(
      API_ENDPOINTS.examinations.onlineExamQuestions(examId),
      payload,
    );
    return data.data;
  },

  removeExamQuestion: async (examId: number, linkId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.examinations.onlineExamQuestionDetail(examId, linkId));
  },

  getRoster: async (
    examId: number,
    classId: number,
    sectionId: number,
  ): Promise<OnlineExamRoster> => {
    const { data } = await apiClient.get<ApiSuccessResponse<OnlineExamRoster>>(
      API_ENDPOINTS.examinations.onlineExamStudentsRoster(examId),
      { params: { class_id: classId, section_id: sectionId } },
    );
    return data.data;
  },

  assignStudents: async (
    examId: number,
    studentSessionIds: number[],
  ): Promise<{ assigned_count: number; skipped: number }> => {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ assigned_count: number; skipped: number }>
    >(API_ENDPOINTS.examinations.onlineExamStudents(examId), {
      student_session_ids: studentSessionIds,
    });
    return data.data;
  },

  unassignStudent: async (examId: number, assignmentId: number): Promise<void> => {
    await apiClient.delete(
      API_ENDPOINTS.examinations.onlineExamStudentDetail(examId, assignmentId),
    );
  },
};
