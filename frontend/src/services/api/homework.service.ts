import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { PaginatedResponse } from '@app-types/api';
import type {
  CreateDailyAssignmentPayload,
  CreateHomeworkPayload,
  DailyAssignment,
  DailyAssignmentListFilters,
  Homework,
  HomeworkListFilters,
  UpdateDailyAssignmentPayload,
  UpdateHomeworkPayload,
} from '@app-types/academics/homework';

/** Homework endpoints use DRF generics (paginated `results` at top level). */
function unwrapList<T>(data: unknown): PaginatedResponse<T> {
  if (!data || typeof data !== 'object') {
    return { count: 0, next: null, previous: null, results: [] };
  }
  const body = data as Record<string, unknown>;
  if (Array.isArray(body.results)) {
    return {
      count: typeof body.count === 'number' ? body.count : body.results.length,
      next: (body.next as string | null) ?? null,
      previous: (body.previous as string | null) ?? null,
      results: body.results as T[],
    };
  }
  if (body.data && typeof body.data === 'object') {
    return unwrapList<T>(body.data);
  }
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data as T[] };
  }
  return { count: 0, next: null, previous: null, results: [] };
}

function unwrapEntity<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

export const homeworkService = {
  list: async (filters: HomeworkListFilters = {}): Promise<PaginatedResponse<Homework>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.academics.homework, {
      params: {
        ...(filters.class_id ? { class_id: filters.class_id } : {}),
        ...(filters.section_id ? { section_id: filters.section_id } : {}),
        ...(filters.session_id ? { session_id: filters.session_id } : {}),
        ...(filters.subject_id ? { subject_id: filters.subject_id } : {}),
        ...(filters.staff_id ? { staff_id: filters.staff_id } : {}),
        ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
        ...(filters.page ? { page: filters.page } : {}),
      },
    });
    return unwrapList<Homework>(data);
  },

  create: async (payload: CreateHomeworkPayload): Promise<Homework> => {
    const { data } = await apiClient.post(API_ENDPOINTS.academics.homework, payload);
    return unwrapEntity<Homework>(data);
  },

  update: async (id: number, payload: UpdateHomeworkPayload): Promise<Homework> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.academics.homeworkDetail(id), payload);
    return unwrapEntity<Homework>(data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.academics.homeworkDetail(id));
  },
};

export const dailyAssignmentsService = {
  list: async (
    filters: DailyAssignmentListFilters = {},
  ): Promise<PaginatedResponse<DailyAssignment>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.academics.dailyAssignments, {
      params: {
        ...(filters.student_session_id ? { student_session_id: filters.student_session_id } : {}),
        ...(filters.subject_group_subject_id
          ? { subject_group_subject_id: filters.subject_group_subject_id }
          : {}),
        ...(filters.evaluated_by ? { evaluated_by: filters.evaluated_by } : {}),
        ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
        ...(filters.page ? { page: filters.page } : {}),
      },
    });
    return unwrapList<DailyAssignment>(data);
  },

  create: async (payload: CreateDailyAssignmentPayload): Promise<DailyAssignment> => {
    const { data } = await apiClient.post(API_ENDPOINTS.academics.dailyAssignments, payload);
    return unwrapEntity<DailyAssignment>(data);
  },

  update: async (id: number, payload: UpdateDailyAssignmentPayload): Promise<DailyAssignment> => {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.academics.dailyAssignmentDetail(id),
      payload,
    );
    return unwrapEntity<DailyAssignment>(data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.academics.dailyAssignmentDetail(id));
  },
};
