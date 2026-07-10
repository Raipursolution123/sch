import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateTimetablePeriodPayload,
  TimetablePeriod,
  TimetableSubjectOption,
  UpdateTimetablePeriodPayload,
} from '@app-types/academics/timetable';
import { type BackendPayload, extractList } from '@utils/api-response';

function gridQuery(sessionId: number, classId: number, sectionId: number): string {
  return `session_id=${sessionId}&class_id=${classId}&section_id=${sectionId}`;
}

export const timetableService = {
  list: async (
    sessionId: number,
    classId: number,
    sectionId: number,
  ): Promise<TimetablePeriod[]> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.academics.timetable}?${gridQuery(sessionId, classId, sectionId)}`,
    );
    return extractList<TimetablePeriod>(data, 'periods');
  },

  subjectOptions: async (
    sessionId: number,
    classId: number,
    sectionId: number,
  ): Promise<TimetableSubjectOption[]> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.academics.timetableSubjectOptions}?${gridQuery(sessionId, classId, sectionId)}`,
    );
    return extractList<TimetableSubjectOption>(data, 'options');
  },

  create: async (payload: CreateTimetablePeriodPayload): Promise<TimetablePeriod> => {
    const { data } = await apiClient.post<ApiSuccessResponse<TimetablePeriod>>(
      API_ENDPOINTS.academics.timetable,
      payload,
    );
    return data.data;
  },

  update: async (
    id: number,
    payload: UpdateTimetablePeriodPayload,
  ): Promise<TimetablePeriod> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<TimetablePeriod>>(
      API_ENDPOINTS.academics.timetableDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.academics.timetableDetail(id));
  },
};
