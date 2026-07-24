import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  AlumniEvent,
  AlumniEventCreatePayload,
  AlumniEventUpdatePayload,
  AlumniStudent,
  AlumniStudentCreatePayload,
  AlumniStudentUpdatePayload,
} from '@app-types/alumni';
import { type BackendPayload, extractList } from '@utils/api-response';

const listParams = (query?: string) => ({
  page_size: 100,
  ...(query ? { q: query } : {}),
});

export const alumniService = {
  listStudents: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.alumni.students, {
      params: listParams(query),
    });
    return extractList<AlumniStudent>(data);
  },

  createStudent: async (payload: AlumniStudentCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<AlumniStudent>>(
      API_ENDPOINTS.alumni.students,
      payload,
    );
    return data.data;
  },

  updateStudent: async (id: number, payload: AlumniStudentUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<AlumniStudent>>(
      API_ENDPOINTS.alumni.studentDetail(id),
      payload,
    );
    return data.data;
  },

  deleteStudent: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.alumni.studentDetail(id));
  },

  listEvents: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.alumni.events, {
      params: listParams(query),
    });
    return extractList<AlumniEvent>(data);
  },

  createEvent: async (payload: AlumniEventCreatePayload) => {
    const { data } = await apiClient.post<ApiSuccessResponse<AlumniEvent>>(
      API_ENDPOINTS.alumni.events,
      payload,
    );
    return data.data;
  },

  updateEvent: async (id: number, payload: AlumniEventUpdatePayload) => {
    const { data } = await apiClient.patch<ApiSuccessResponse<AlumniEvent>>(
      API_ENDPOINTS.alumni.eventDetail(id),
      payload,
    );
    return data.data;
  },

  deleteEvent: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.alumni.eventDetail(id));
  },

  getReport: async (query?: string) => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.alumni.report, {
      params: listParams(query),
    });
    return extractList<AlumniStudent>(data);
  },
};
