import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  StudentDetail,
  StudentListItem,
  CreateStudentPayload,
  UpdateStudentPayload,
} from '@app-types/students/student';
import { suggestAdmissionNumber } from '@utils/student';

export const studentsService = {
  list: async (): Promise<StudentListItem[]> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.students.list);

    // Handle DRF paginated response: { count, next, previous, results: [...] }
    if (data?.results && Array.isArray(data.results)) {
      return data.results;
    }
    // Handle APIResponse wrapper: { success, message, data: [...] }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    // Handle APIResponse wrapper with nested results: { success, message, data: { results: [...] } }
    if (data?.data?.results && Array.isArray(data.data.results)) {
      return data.data.results;
    }

    return [];
  },

  getById: async (id: number): Promise<StudentDetail> => {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentDetail>>(
      API_ENDPOINTS.students.detail(id),
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
};
