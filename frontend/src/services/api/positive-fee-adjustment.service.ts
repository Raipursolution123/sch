import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import { type BackendPayload, extractEntity, extractList } from '@utils/api-response';

export interface PositiveFeeAdjustment {
  id: number;
  student_session_id: number;
  student_id: number | null;
  student_name: string;
  amount: number;
  remark: string;
  date: string | null;
}

export interface PositiveFeeAdjustmentRoster {
  session_id: number;
  students: Array<{
    student_id: number;
    student_session_id: number;
    admission_no: string;
    student_name: string;
    class_id: number;
    class_name: string;
    section_id: number;
    section_name: string;
  }>;
}

export const positiveFeeAdjustmentService = {
  list: async (): Promise<PositiveFeeAdjustment[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.positiveAdjustments);
    return extractList<PositiveFeeAdjustment>(data);
  },

  getRoster: async (classId?: number, sectionId?: number): Promise<PositiveFeeAdjustmentRoster> => {
    const params = new URLSearchParams({ roster: '1' });
    if (classId) params.set('class_id', String(classId));
    if (sectionId) params.set('section_id', String(sectionId));
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.fees.positiveAdjustments}?${params.toString()}`,
    );
    return extractEntity<PositiveFeeAdjustmentRoster>(data);
  },

  applyBulk: async (
    adjustments: Array<{ student_id: number; amount: number; remark?: string }>,
  ): Promise<{ applied_count: number }> => {
    const { data } = await apiClient.post<ApiSuccessResponse<{ applied_count: number }>>(
      API_ENDPOINTS.fees.positiveAdjustmentsApply,
      { adjustments },
    );
    return data.data;
  },
};
