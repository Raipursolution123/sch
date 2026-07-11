import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  AssignClassTeacherPayload,
  ClassTeacherAssignment,
  UpdateClassTeacherPayload,
} from '@app-types/academics/class-teacher';
import { type BackendPayload, extractList } from '@utils/api-response';

function listQuery(sessionId: number, classId?: number, sectionId?: number): string {
  const params = new URLSearchParams({ session_id: String(sessionId) });
  if (classId !== undefined) params.set('class_id', String(classId));
  if (sectionId !== undefined) params.set('section_id', String(sectionId));
  return params.toString();
}

export const classTeachersService = {
  list: async (
    sessionId: number,
    classId?: number,
    sectionId?: number,
  ): Promise<ClassTeacherAssignment[]> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.academics.classTeachers}?${listQuery(sessionId, classId, sectionId)}`,
    );
    return extractList<ClassTeacherAssignment>(data, 'assignments');
  },

  create: async (payload: AssignClassTeacherPayload): Promise<ClassTeacherAssignment> => {
    const { data } = await apiClient.post<ApiSuccessResponse<ClassTeacherAssignment>>(
      API_ENDPOINTS.academics.classTeachers,
      payload,
    );
    return data.data;
  },

  update: async (
    id: number,
    payload: UpdateClassTeacherPayload,
  ): Promise<ClassTeacherAssignment> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<ClassTeacherAssignment>>(
      API_ENDPOINTS.academics.classTeacherDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.academics.classTeacherDetail(id));
  },
};
