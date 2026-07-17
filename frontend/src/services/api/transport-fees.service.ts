import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  TransportFeeMaster,
  CreateTransportFeeMasterPayload,
  UpdateTransportFeeMasterPayload,
} from '@app-types/index';
import { type BackendPayload, extractList } from '@utils/api-response';

export const transportFeesService = {
  list: async (sessionId?: number): Promise<TransportFeeMaster[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.transport.fees, {
      params: sessionId ? { session_id: sessionId } : undefined,
    });
    return extractList<TransportFeeMaster>(data);
  },

  create: async (payload: CreateTransportFeeMasterPayload): Promise<TransportFeeMaster> => {
    const { data } = await apiClient.post<ApiSuccessResponse<TransportFeeMaster>>(
      API_ENDPOINTS.transport.fees,
      payload,
    );
    return data.data;
  },

  update: async (
    id: number,
    payload: UpdateTransportFeeMasterPayload,
  ): Promise<TransportFeeMaster> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<TransportFeeMaster>>(
      API_ENDPOINTS.transport.feeDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.transport.feeDetail(id));
  },
};
