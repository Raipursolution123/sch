import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  TransportRoute,
  CreateTransportRoutePayload,
  UpdateTransportRoutePayload,
} from '@app-types/index';
import { type BackendPayload, extractList } from '@utils/api-response';

export const routesService = {
  list: async (): Promise<TransportRoute[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.transport.routes);
    return extractList<TransportRoute>(data);
  },

  create: async (payload: CreateTransportRoutePayload): Promise<TransportRoute> => {
    const { data } = await apiClient.post<ApiSuccessResponse<TransportRoute>>(
      API_ENDPOINTS.transport.routes,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateTransportRoutePayload): Promise<TransportRoute> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<TransportRoute>>(
      API_ENDPOINTS.transport.routeDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.transport.routeDetail(id));
  },
};
