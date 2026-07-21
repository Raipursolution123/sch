import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/index';
import type {
  LedgerGroup,
  LedgerGroupCreatePayload,
  LedgerGroupUpdatePayload,
} from '@app-types/finance';
import type { ApiSuccessResponse, PaginatedResponse } from '@app-types/api';

export const ledgerGroupsService = {
  getGroups: async (page = 1) => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<LedgerGroup>>>(
      API_ENDPOINTS.finance.groups,
      { params: { page } },
    );
    return response.data.data;
  },

  getAllGroups: async () => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<LedgerGroup>>>(
      API_ENDPOINTS.finance.groups,
      { params: { page: 1, page_size: 100 } },
    );
    return response.data.data.results || [];
  },

  createGroup: async (data: LedgerGroupCreatePayload) => {
    const response = await apiClient.post<{ data: LedgerGroup; message: string }>(
      API_ENDPOINTS.finance.groups,
      data,
    );
    return response.data;
  },

  updateGroup: async (id: number, data: LedgerGroupUpdatePayload) => {
    const response = await apiClient.put<{ data: LedgerGroup; message: string }>(
      API_ENDPOINTS.finance.groupDetail(id),
      data,
    );
    return response.data;
  },

  deleteGroup: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.finance.groupDetail(id),
    );
    return response.data;
  },
};
