import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateStaffDepartmentPayload,
  CreateStaffDesignationPayload,
  StaffDepartment,
  StaffDesignation,
  UpdateStaffDepartmentPayload,
  UpdateStaffDesignationPayload,
} from '@app-types/staff/staff';
import { type BackendPayload, extractList } from '@utils/api-response';

export const staffMastersService = {
  listDepartments: async (query?: string): Promise<StaffDepartment[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.staff.departments, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<StaffDepartment>(data);
  },

  createDepartment: async (payload: CreateStaffDepartmentPayload): Promise<StaffDepartment> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffDepartment>>(
      API_ENDPOINTS.staff.departments,
      payload,
    );
    return data.data;
  },

  updateDepartment: async (
    id: number,
    payload: UpdateStaffDepartmentPayload,
  ): Promise<StaffDepartment> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StaffDepartment>>(
      API_ENDPOINTS.staff.departmentDetail(id),
      payload,
    );
    return data.data;
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.staff.departmentDetail(id));
  },

  listDesignations: async (query?: string): Promise<StaffDesignation[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.staff.designations, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<StaffDesignation>(data);
  },

  createDesignation: async (payload: CreateStaffDesignationPayload): Promise<StaffDesignation> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffDesignation>>(
      API_ENDPOINTS.staff.designations,
      payload,
    );
    return data.data;
  },

  updateDesignation: async (
    id: number,
    payload: UpdateStaffDesignationPayload,
  ): Promise<StaffDesignation> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StaffDesignation>>(
      API_ENDPOINTS.staff.designationDetail(id),
      payload,
    );
    return data.data;
  },

  deleteDesignation: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.staff.designationDetail(id));
  },
};
