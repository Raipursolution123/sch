import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import { type BackendPayload, extractList } from '@utils/api-response';

export interface StaffPayrollIncrement {
  id: number;
  staff_id: number;
  staff_name: string;
  employee_id: string;
  month: string;
  year: string;
  basic_salary: number;
  increment: number;
  date: string | null;
  entry_by: number;
  status: 'pending' | 'approved' | 'rejected' | string;
  action_by: number;
  action_date: string | null;
}

export interface CreateStaffPayrollIncrementPayload {
  staff_id: number;
  increment: number;
  month?: string;
  year?: string;
}

export const staffPayrollIncrementService = {
  list: async (status?: string): Promise<StaffPayrollIncrement[]> => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.staff.payrollIncrements}${qs}`,
    );
    return extractList<StaffPayrollIncrement>(data);
  },

  create: async (payload: CreateStaffPayrollIncrementPayload): Promise<StaffPayrollIncrement> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffPayrollIncrement>>(
      API_ENDPOINTS.staff.payrollIncrements,
      payload,
    );
    return data.data;
  },

  approve: async (id: number): Promise<StaffPayrollIncrement> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffPayrollIncrement>>(
      API_ENDPOINTS.staff.payrollIncrementApprove(id),
    );
    return data.data;
  },

  reject: async (id: number): Promise<StaffPayrollIncrement> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffPayrollIncrement>>(
      API_ENDPOINTS.staff.payrollIncrementReject(id),
    );
    return data.data;
  },
};
