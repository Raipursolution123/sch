import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  AcademicSession,
  CreateSessionPayload,
  UpdateSessionPayload,
} from '@app-types/settings/session';

// TODO: Remove mock store when GET /api/v1/settings/sessions/ is available
let mockSessions: AcademicSession[] = [
  {
    id: 1,
    session: '2025-26',
    is_active: 'yes',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    session: '2024-25',
    is_active: 'no',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2025-03-31',
  },
];
let nextMockId = 3;

const USE_MOCK = true; // TODO: Set to false when backend sessions API is deployed

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function mockList(): AcademicSession[] {
  return [...mockSessions].sort((a, b) => b.session.localeCompare(a.session));
}

function mockGetActive(): AcademicSession | null {
  return mockSessions.find((s) => s.is_active === 'yes') ?? null;
}

export const sessionsService = {
  list: async (): Promise<AcademicSession[]> => {
    if (USE_MOCK) {
      return delay(mockList());
    }
    // TODO: Wire when backend exposes GET /api/v1/settings/sessions/
    const { data } = await apiClient.get<ApiSuccessResponse<AcademicSession[]>>(
      API_ENDPOINTS.settings.sessions,
    );
    return data.data;
  },

  getActive: async (): Promise<AcademicSession | null> => {
    if (USE_MOCK) {
      return delay(mockGetActive());
    }
    // TODO: Wire when backend exposes GET /api/v1/settings/sessions/active/
    const sessions = await sessionsService.list();
    return sessions.find((s) => s.is_active === 'yes') ?? null;
  },

  create: async (payload: CreateSessionPayload): Promise<AcademicSession> => {
    if (USE_MOCK) {
      const created: AcademicSession = {
        id: nextMockId++,
        session: payload.session,
        is_active: 'no',
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockSessions = [...mockSessions, created];
      return delay(created);
    }
    // TODO: Wire when backend exposes POST /api/v1/settings/sessions/
    const { data } = await apiClient.post<ApiSuccessResponse<AcademicSession>>(
      API_ENDPOINTS.settings.sessions,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateSessionPayload): Promise<AcademicSession> => {
    if (USE_MOCK) {
      const index = mockSessions.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Session not found');
      const updated: AcademicSession = {
        ...mockSessions[index],
        session: payload.session,
        updated_at: new Date().toISOString().slice(0, 10),
      };
      mockSessions = mockSessions.map((s) => (s.id === id ? updated : s));
      return delay(updated);
    }
    // TODO: Wire when backend exposes PATCH /api/v1/settings/sessions/{id}/
    const { data } = await apiClient.patch<ApiSuccessResponse<AcademicSession>>(
      API_ENDPOINTS.settings.sessionDetail(id),
      payload,
    );
    return data.data;
  },

  activate: async (id: number): Promise<AcademicSession> => {
    if (USE_MOCK) {
      const target = mockSessions.find((s) => s.id === id);
      if (!target) throw new Error('Session not found');
      mockSessions = mockSessions.map((s) => ({
        ...s,
        is_active: s.id === id ? 'yes' : 'no',
        updated_at: s.id === id ? new Date().toISOString().slice(0, 10) : s.updated_at,
      }));
      return delay(mockSessions.find((s) => s.id === id)!);
    }
    // TODO: Wire when backend exposes POST /api/v1/settings/sessions/{id}/activate/
    const { data } = await apiClient.post<ApiSuccessResponse<AcademicSession>>(
      API_ENDPOINTS.settings.sessionActivate(id),
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const target = mockSessions.find((s) => s.id === id);
      if (!target) throw new Error('Session not found');
      if (target.is_active === 'yes') {
        throw new Error('Cannot delete the active academic session');
      }
      mockSessions = mockSessions.filter((s) => s.id !== id);
      return delay(undefined);
    }
    // TODO: Wire when backend exposes DELETE /api/v1/settings/sessions/{id}/
    await apiClient.delete(API_ENDPOINTS.settings.sessionDetail(id));
  },
};
