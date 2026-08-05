import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  StudentDetail,
  StudentListItem,
  CreateStudentPayload,
  UpdateStudentPayload,
} from '@app-types/students/student';
import type { DisableReason, DisableStudentPayload } from '@app-types/students/disable-reason';
import type {
  StudentTransportAssignment,
  UpdateStudentTransportPayload,
} from '@app-types/transport';
import { suggestAdmissionNumber } from '@utils/student';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

export type StudentListStatus = 'active' | 'disabled' | 'all';

export const studentsService = {
  listPaginated: async (
    page = 1,
    pageSize = 20,
    status: StudentListStatus = 'active',
    search = '',
  ): Promise<{ results: StudentListItem[]; count: number }> => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      status,
    });
    const term = search.trim();
    if (term) params.set('search', term);

    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.students.list}?${params.toString()}`,
    );
    const results = extractList<StudentListItem>(data);
    return { results, count: extractCount(data, results.length) };
  },

  /** Convenience fetch for pickers — capped at API max page size. */
  list: async (status: StudentListStatus = 'active'): Promise<StudentListItem[]> => {
    const { results } = await studentsService.listPaginated(1, 100, status);
    return results;
  },

  getById: async (id: number): Promise<StudentDetail> => {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentDetail>>(
      API_ENDPOINTS.students.detail(id),
    );
    return data.data;
  },

  getTransport: async (id: number): Promise<StudentTransportAssignment> => {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentTransportAssignment>>(
      API_ENDPOINTS.students.transport(id),
    );
    return data.data;
  },

  updateTransport: async (
    id: number,
    payload: UpdateStudentTransportPayload,
  ): Promise<StudentTransportAssignment> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StudentTransportAssignment>>(
      API_ENDPOINTS.students.transport(id),
      payload,
    );
    return data.data;
  },

  suggestAdmissionNo: async (): Promise<string> => {
    const students = await studentsService.list();
    return suggestAdmissionNumber(students.map((s) => s.admission_no));
  },

  create: async (payload: CreateStudentPayload): Promise<StudentDetail> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StudentDetail>>(
      API_ENDPOINTS.students.list,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateStudentPayload): Promise<StudentDetail> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StudentDetail>>(
      API_ENDPOINTS.students.detail(id),
      payload,
    );
    return data.data;
  },

  disable: async (id: number, payload: DisableStudentPayload): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.students.disable(id), payload);
  },

  listDisableReasons: async (): Promise<DisableReason[]> => {
    const { data } = await apiClient.get<ApiSuccessResponse<DisableReason[]>>(
      API_ENDPOINTS.students.disableReasons,
    );
    return data.data;
  },

  enable: async (id: number): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.students.enable(id));
  },
};
