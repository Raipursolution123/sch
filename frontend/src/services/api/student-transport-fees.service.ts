import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import { type BackendPayload, extractEntity } from '@utils/api-response';

export interface StudentTransportFeeRoster {
  session_id: number;
  fee_masters: Array<{ id: number; month: string; due_date: string | null }>;
  students: Array<{
    student_id: number;
    student_session_id: number;
    admission_no: string;
    student_name: string;
    class_name: string;
    section_name: string;
    route_title: string | null;
    pickup_point: string | null;
    monthly_fees: number;
    route_pickup_point_id: number | null;
    assigned_feemaster_ids: number[];
  }>;
}

export const studentTransportFeesService = {
  getRoster: async (classId?: number, sectionId?: number): Promise<StudentTransportFeeRoster> => {
    const params = new URLSearchParams();
    if (classId) params.set('class_id', String(classId));
    if (sectionId) params.set('section_id', String(sectionId));
    const qs = params.toString() ? `?${params.toString()}` : '';
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.transport.studentFeesRoster}${qs}`,
    );
    return extractEntity<StudentTransportFeeRoster>(data);
  },

  assign: async (payload: {
    student_session_id: number;
    route_pickup_point_id: number;
    transport_feemaster_ids: number[];
  }): Promise<StudentTransportFeeRoster> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StudentTransportFeeRoster>>(
      API_ENDPOINTS.transport.studentFeesAssign,
      payload,
    );
    return data.data;
  },
};
