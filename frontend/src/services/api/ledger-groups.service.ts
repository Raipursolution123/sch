import { apiClient } from './client';
import type {
  LedgerGroup,
  LedgerGroupCreatePayload,
  LedgerGroupUpdatePayload,
} from '@/types/finance';
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api';

const BASE_PATH = '/finance/groups/';

export const ledgerGroupsService = {
  getGroups: async (page = 1) => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<LedgerGroup>>>(
      BASE_PATH,
      {
        params: { page },
      },
    );
    // Assuming backend returns paginated data, but if we need a flat list for a dropdown, we might fetch all or just the first page.
    return response.data.data;
  },

  // If we need a non-paginated fetch for dropdowns:
  getAllGroups: async () => {
    // Sometimes a 'limit=0' or similar is used, but for now we'll just fetch a large page
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<LedgerGroup>>>(
      BASE_PATH,
      {
        params: { page: 1, limit: 1000 },
      },
    );
    return response.data.data.results || [];
  },

  createGroup: async (data: LedgerGroupCreatePayload) => {
    const response = await apiClient.post<{ data: LedgerGroup; message: string }>(BASE_PATH, data);
    return response.data;
  },

  updateGroup: async (id: number, data: LedgerGroupUpdatePayload) => {
    const response = await apiClient.put<{ data: LedgerGroup; message: string }>(
      `${BASE_PATH}${id}/`,
      data,
    );
    return response.data;
  },

  deleteGroup: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`${BASE_PATH}${id}/`);
    return response.data;
  },
};
