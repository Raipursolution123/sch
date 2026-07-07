import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateFeeGroupPayload,
  FeeGroup,
  UpdateFeeGroupPayload,
} from '@app-types/fees/fee-group';

export const feeGroupsService = {
  list: async (): Promise<FeeGroup[]> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.fees.feeGroups);
    
    // Handle DRF paginated response: { count, next, previous, results: [...] }
    if (data?.results && Array.isArray(data.results)) {
      return data.results;
    }
    // Handle APIResponse wrapper: { success, message, data: [...] }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    // Handle APIResponse wrapper with nested results
    if (data?.data?.results && Array.isArray(data.data.results)) {
      return data.data.results;
    }
    
    return [];
  },

  create: async (payload: CreateFeeGroupPayload): Promise<FeeGroup> => {
    const { data } = await apiClient.post<ApiSuccessResponse<FeeGroup>>(
      API_ENDPOINTS.fees.feeGroups,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateFeeGroupPayload): Promise<FeeGroup> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<FeeGroup>>(
      API_ENDPOINTS.fees.feeGroupDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.fees.feeGroupDetail(id));
  },
};
