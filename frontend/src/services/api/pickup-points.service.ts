import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  PickupPoint,
  CreatePickupPointPayload,
  UpdatePickupPointPayload,
} from '@app-types/index';
import { type BackendPayload, extractList } from '@utils/api-response';

export const pickupPointsService = {
  list: async (): Promise<PickupPoint[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.transport.pickupPoints);
    return extractList<PickupPoint>(data);
  },

  create: async (payload: CreatePickupPointPayload): Promise<PickupPoint> => {
    const { data } = await apiClient.post<ApiSuccessResponse<PickupPoint>>(
      API_ENDPOINTS.transport.pickupPoints,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdatePickupPointPayload): Promise<PickupPoint> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<PickupPoint>>(
      API_ENDPOINTS.transport.pickupPointDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.transport.pickupPointDetail(id));
  },
};
