import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  RoleDetail,
  RoleSummary,
  StaffUserAccount,
  UpdateRolePermissionsPayload,
  UpdateStaffUserPayload,
} from '@app-types/settings/roles';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

export const rolesService = {
  list: async (page: number = 1): Promise<{ results: RoleSummary[]; count: number }> => {
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.settings.roles}?page=${page}`,
    );
    const results = extractList<RoleSummary>(data);
    return { results, count: extractCount(data, results.length) };
  },

  get: async (id: number): Promise<RoleDetail> => {
    const { data } = await apiClient.get<ApiSuccessResponse<RoleDetail>>(
      API_ENDPOINTS.settings.roleDetail(id),
    );
    return data.data;
  },

  updatePermissions: async (
    id: number,
    payload: UpdateRolePermissionsPayload,
  ): Promise<RoleDetail> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<RoleDetail>>(
      API_ENDPOINTS.settings.rolePermissions(id),
      payload,
    );
    return data.data;
  },
};

export const usersService = {
  list: async (
    page: number = 1,
    q: string = '',
  ): Promise<{ results: StaffUserAccount[]; count: number }> => {
    const params = new URLSearchParams({ page: String(page) });
    if (q.trim()) params.set('q', q.trim());
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.settings.users}?${params.toString()}`,
    );
    const results = extractList<StaffUserAccount>(data);
    return { results, count: extractCount(data, results.length) };
  },

  update: async (id: number, payload: UpdateStaffUserPayload): Promise<StaffUserAccount> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<StaffUserAccount>>(
      API_ENDPOINTS.settings.userDetail(id),
      payload,
    );
    return data.data;
  },

  roleOptions: async (): Promise<RoleSummary[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.settings.userRoleOptions);
    return extractList<RoleSummary>(data);
  },
};
