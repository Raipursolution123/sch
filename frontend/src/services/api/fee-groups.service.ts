import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateFeeGroupPayload,
  FeeGroup,
  UpdateFeeGroupPayload,
} from '@app-types/fees/fee-group';
import { type BackendPayload, extractList } from '@utils/api-response';

export const feeGroupsService = {
  list: async (): Promise<FeeGroup[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.feeGroups);
    return extractList<FeeGroup>(data);
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
