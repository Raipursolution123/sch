import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  AcademicSession,
  CreateSessionPayload,
  UpdateSessionPayload,
} from '@app-types/settings/session';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

export const sessionsService = {
  list: async (page: number = 1): Promise<{ results: AcademicSession[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.settings.sessions}?page=${page}`,
    );
    const results = extractList<AcademicSession>(data, 'sessions');
    return { results, count: extractCount(data, results.length) };
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
