import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import { type BackendPayload, extractEntity } from '@utils/api-response';

export interface MultiClassEnrollment {
  student_session_id: number;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  is_primary: boolean;
}

export interface MultiClassStudent {
  student_id: number;
  admission_no: string;
  student_name: string;
  primary_class_id: number;
  primary_class_name: string;
  primary_section_id: number;
  primary_section_name: string;
  enrollments: MultiClassEnrollment[];
}

export interface MultiClassRoster {
  session_id: number;
  students: MultiClassStudent[];
}

export const multiClassService = {
  getRoster: async (classId?: number, sectionId?: number): Promise<MultiClassRoster> => {
    const params = new URLSearchParams();
    if (classId) params.set('class_id', String(classId));
    if (sectionId) params.set('section_id', String(sectionId));
    const qs = params.toString() ? `?${params.toString()}` : '';
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.students.multiClassRoster}${qs}`,
    );
    return extractEntity<MultiClassRoster>(data);
  },

  save: async (payload: {
    student_id: number;
    enrollments: Array<{ class_id: number; section_id: number }>;
  }): Promise<MultiClassRoster> => {
    const { data } = await apiClient.post<ApiSuccessResponse<MultiClassRoster>>(
      API_ENDPOINTS.students.multiClassSave,
      payload,
    );
    return data.data;
  },
};
