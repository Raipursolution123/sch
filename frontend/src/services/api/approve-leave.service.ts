import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/api-endpoints';
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api';

export interface ApproveLeave {
  id: string;
  student_session_id: number;
  student_name: string;
  class_name: string;
  section_name: string;
  from_date: string;
  to_date: string;
  apply_date: string;
  status: number;
  docs: string | null;
  reason: string;
  approve_by: number | null;
  request_type: number;
  is_attendance: boolean;
  attendance_type_label: string | null;
}

export interface CreateApproveLeavePayload {
  roll_no: string;
  from_date: string;
  to_date: string;
  reason: string;
  docs?: string;
  request_type?: number;
}

export type ApproveLeaveUpdatePayload = {
  status?: number;
  reason?: string;
  from_date?: string;
  to_date?: string;
};

export const approveLeaveService = {
  list: async (page = 1): Promise<PaginatedResponse<ApproveLeave>> => {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResponse<ApproveLeave>>>(
      `${API_ENDPOINTS.attendance.approveLeave}?page=${page}`
    );
    return data.data;
  },

  get: async (id: string): Promise<ApproveLeave> => {
    const { data } = await apiClient.get<ApiSuccessResponse<ApproveLeave>>(
      API_ENDPOINTS.attendance.approveLeaveDetail(id)
    );
    return data.data;
  },

  create: async (payload: CreateApproveLeavePayload): Promise<ApproveLeave> => {
    const { data } = await apiClient.post<ApiSuccessResponse<ApproveLeave>>(
      API_ENDPOINTS.attendance.approveLeave,
      payload
    );
    return data.data;
  },

  update: async (id: string, payload: ApproveLeaveUpdatePayload): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.attendance.approveLeaveDetail(id), payload);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.attendance.approveLeaveDetail(id));
  },
};
