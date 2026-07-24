import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateStaffPayScalePayload,
  CreateStaffPayslipPayload,
  StaffPayScale,
  StaffPayslip,
  UpdateStaffPayScalePayload,
} from '@app-types/staff/payroll';
import { type BackendPayload, extractList } from '@utils/api-response';

export const staffPayrollService = {
  listScales: async (query?: string): Promise<StaffPayScale[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.staff.payrollScales, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<StaffPayScale>(data);
  },

  createScale: async (payload: CreateStaffPayScalePayload): Promise<StaffPayScale> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffPayScale>>(
      API_ENDPOINTS.staff.payrollScales,
      payload,
    );
    return data.data;
  },

  updateScale: async (id: number, payload: UpdateStaffPayScalePayload): Promise<StaffPayScale> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StaffPayScale>>(
      API_ENDPOINTS.staff.payrollScaleDetail(id),
      payload,
    );
    return data.data;
  },

  deleteScale: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.staff.payrollScaleDetail(id));
  },

  listPayslips: async (staffId?: number): Promise<StaffPayslip[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.staff.payrollPayslips, {
      params: {
        page_size: 100,
        ...(staffId ? { staff_id: staffId } : {}),
      },
    });
    return extractList<StaffPayslip>(data);
  },

  createPayslip: async (payload: CreateStaffPayslipPayload): Promise<StaffPayslip> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffPayslip>>(
      API_ENDPOINTS.staff.payrollPayslips,
      payload,
    );
    return data.data;
  },

  deletePayslip: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.staff.payrollPayslipDetail(id));
  },
};
