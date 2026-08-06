import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { StaffPayrollIncrement, CreatePayrollIncrementPayload } from '@app-types/staff/payroll-increment';
import { type BackendPayload, extractList } from '@utils/api-response';

export const staffPayrollIncrementService = {
  list: async (): Promise<StaffPayrollIncrement[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.staff.payrollIncrements, {
      params: { page_size: 1000 },
    });
    return extractList<StaffPayrollIncrement>(data);
  },

  create: async (payload: CreatePayrollIncrementPayload): Promise<StaffPayrollIncrement> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffPayrollIncrement>>(
      API_ENDPOINTS.staff.payrollIncrements,
      payload,
    );
    return data.data;
  },

  approve: async (id: number): Promise<any> => {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>(
      API_ENDPOINTS.staff.payrollIncrementApprove(id),
    );
    return data.data;
  },

  reject: async (id: number): Promise<any> => {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>(
      API_ENDPOINTS.staff.payrollIncrementReject(id),
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.staff.payrollIncrementDetail(id));
  },
};
