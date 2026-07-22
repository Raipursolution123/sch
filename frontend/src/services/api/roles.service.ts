import { apiClient } from './client';
import type { Role, RolePermission, RoleCreatePayload, RoleUpdatePayload } from '@/types/settings/roles';
import type { ApiSuccessResponse } from '@/types/api';

export const rolesService = {
  getRoles: async () => {
    const response = await apiClient.get<ApiSuccessResponse<Role[]>>('/roles/');
    return response.data.data;
  },

  createRole: async (data: RoleCreatePayload) => {
    const response = await apiClient.post<{ data: Role; message: string }>('/roles/', data);
    return response.data;
  },

  updateRole: async (id: number, data: RoleUpdatePayload) => {
    const response = await apiClient.put<{ data: Role; message: string }>(`/roles/${id}/`, data);
    return response.data;
  },

  deleteRole: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`/roles/${id}/`);
    return response.data;
  },

  getRolePermissions: async (roleId: number) => {
    const response = await apiClient.get<ApiSuccessResponse<RolePermission[]>>(`/roles/${roleId}/permissions/`);
    return response.data.data;
  },

  updateRolePermissions: async (roleId: number, permissions: Partial<RolePermission>[]) => {
    const response = await apiClient.put<{ message: string }>(`/roles/${roleId}/permissions/`, { permissions });
    return response.data;
  },
};
