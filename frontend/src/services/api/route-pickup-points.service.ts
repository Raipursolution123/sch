import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateRoutePickupPointPayload,
  RoutePickupPoint,
  UpdateRoutePickupPointPayload,
} from '@app-types/transport';
import { type BackendPayload, extractList } from '@utils/api-response';

export const routePickupPointsService = {
  list: async (routeId?: number): Promise<RoutePickupPoint[]> => {
    const { data } = await apiClient.get<BackendPayload>(
      API_ENDPOINTS.transport.routePickupPoints,
      routeId ? { params: { route_id: routeId } } : undefined,
    );
    return extractList<RoutePickupPoint>(data);
  },

  create: async (payload: CreateRoutePickupPointPayload): Promise<RoutePickupPoint> => {
    const { data } = await apiClient.post<ApiSuccessResponse<RoutePickupPoint>>(
      API_ENDPOINTS.transport.routePickupPoints,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateRoutePickupPointPayload): Promise<RoutePickupPoint> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<RoutePickupPoint>>(
      API_ENDPOINTS.transport.routePickupPointDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.transport.routePickupPointDetail(id));
  },
};
