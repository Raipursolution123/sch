import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { Vehicle, CreateVehiclePayload, UpdateVehiclePayload } from '@app-types/index';
import { type BackendPayload, extractList } from '@utils/api-response';

export const vehiclesService = {
  list: async (): Promise<Vehicle[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.transport.vehicles);
    return extractList<Vehicle>(data);
  },

  create: async (payload: CreateVehiclePayload): Promise<Vehicle> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Vehicle>>(
      API_ENDPOINTS.transport.vehicles,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateVehiclePayload): Promise<Vehicle> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<Vehicle>>(
      API_ENDPOINTS.transport.vehicleDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.transport.vehicleDetail(id));
  },
};
