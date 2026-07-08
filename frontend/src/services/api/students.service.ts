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
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

export const studentsService = {
  listPaginated: async (
    page = 1,
    pageSize = 20,
  ): Promise<{ results: StudentListItem[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.students.list}?page=${page}&page_size=${pageSize}`,
    );
    const results = extractList<StudentListItem>(data);
    return { results, count: extractCount(data, results.length) };
  },

  list: async (): Promise<StudentListItem[]> => {
    const { results } = await studentsService.listPaginated(1);
    return results;
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

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.students.detail(id));
  },
};
