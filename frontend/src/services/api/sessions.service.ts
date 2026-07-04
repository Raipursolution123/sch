import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  AcademicSession,
  CreateSessionPayload,
  UpdateSessionPayload,
} from '@app-types/settings/session';

export const sessionsService = {
  list: async (page: number = 1): Promise<{ results: AcademicSession[]; count: number }> => {
    const { data } = await apiClient.get<any>(
      `${API_ENDPOINTS.settings.sessions}?page=${page}`,
    );

    // Standard paginated DRF response (results is array)
    if (data?.results && Array.isArray(data.results)) {
      return {
        results: data.results,
        count: data.count || 0,
      };
    }

    // Standard paginated DRF response: { count, next, previous, results: { sessions: [...] } }
    if (data?.results?.sessions && Array.isArray(data.results.sessions)) {
      return {
        results: data.results.sessions,
        count: data.count || 0,
      };
    }

    // Shape 1: APIResponse.success with direct array → { success, message, data: [...] }
    if (data?.data && Array.isArray(data.data)) {
      return { results: data.data, count: data.data.length };
    }

    // Shape 2: APIResponse.success with sessions key → { success, message, data: { sessions: [...] } }
    const dataWithSessions = data?.data as unknown as { sessions?: AcademicSession[] };
    if (dataWithSessions?.sessions && Array.isArray(dataWithSessions.sessions)) {
      return { results: dataWithSessions.sessions, count: dataWithSessions.sessions.length };
    }

    return { results: [], count: 0 };
  },

  getActive: async (): Promise<AcademicSession | null> => {
    const { results: sessions } = await sessionsService.list(1);
    return sessions.find((s) => s.is_active === 'yes') ?? null;
  },

  create: async (payload: CreateSessionPayload): Promise<AcademicSession> => {
    const { data } = await apiClient.post<ApiSuccessResponse<AcademicSession>>(
      API_ENDPOINTS.settings.sessions,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateSessionPayload): Promise<AcademicSession> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<AcademicSession>>(
      API_ENDPOINTS.settings.sessionDetail(id),
      payload,
    );
    return data.data;
  },

  activate: async (id: number): Promise<AcademicSession> => {
    const { data } = await apiClient.post<ApiSuccessResponse<AcademicSession>>(
      API_ENDPOINTS.settings.sessionActivate(id),
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.settings.sessionDetail(id));
  },
};
