import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  Homework,
  CreateHomeworkPayload,
  UpdateHomeworkPayload,
  HomeworkEvaluation,
  CreateHomeworkEvaluationPayload,
  UpdateHomeworkEvaluationPayload,
  DailyAssignment,
  CreateDailyAssignmentPayload,
  UpdateDailyAssignmentPayload,
} from '@app-types/index';
import { type BackendPayload, extractList } from '@utils/api-response';

export const homeworkService = {
  // --- Homework ---
  listHomework: async (params?: Record<string, unknown>): Promise<Homework[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.academics.homework, { params });
    return extractList<Homework>(data);
  },

  createHomework: async (payload: CreateHomeworkPayload): Promise<Homework> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Homework>>(
      API_ENDPOINTS.academics.homework,
      payload,
    );
    return data.data;
  },

  updateHomework: async (id: number, payload: UpdateHomeworkPayload): Promise<Homework> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<Homework>>(
      API_ENDPOINTS.academics.homeworkDetail(id),
      payload,
    );
    return data.data;
  },

  deleteHomework: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.academics.homeworkDetail(id));
  },

  // --- Daily Assignments ---
  listDailyAssignments: async (params?: Record<string, unknown>): Promise<DailyAssignment[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.academics.dailyAssignments, { params });
    return extractList<DailyAssignment>(data);
  },

  createDailyAssignment: async (payload: CreateDailyAssignmentPayload): Promise<DailyAssignment> => {
    const { data } = await apiClient.post<ApiSuccessResponse<DailyAssignment>>(
      API_ENDPOINTS.academics.dailyAssignments,
      payload,
    );
    return data.data;
  },

  updateDailyAssignment: async (id: number, payload: UpdateDailyAssignmentPayload): Promise<DailyAssignment> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<DailyAssignment>>(
      API_ENDPOINTS.academics.dailyAssignmentDetail(id),
      payload,
    );
    return data.data;
  },

  deleteDailyAssignment: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.academics.dailyAssignmentDetail(id));
  },

  // --- Evaluations ---
  listEvaluations: async (params?: Record<string, unknown>): Promise<HomeworkEvaluation[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.academics.homeworkEvaluations, { params });
    return extractList<HomeworkEvaluation>(data);
  },

  createEvaluation: async (payload: CreateHomeworkEvaluationPayload): Promise<HomeworkEvaluation> => {
    const { data } = await apiClient.post<ApiSuccessResponse<HomeworkEvaluation>>(
      API_ENDPOINTS.academics.homeworkEvaluations,
      payload,
    );
    return data.data;
  },

  updateEvaluation: async (id: number, payload: UpdateHomeworkEvaluationPayload): Promise<HomeworkEvaluation> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<HomeworkEvaluation>>(
      API_ENDPOINTS.academics.homeworkEvaluationDetail(id),
      payload,
    );
    return data.data;
  },

  deleteEvaluation: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.academics.homeworkEvaluationDetail(id));
  },
};
