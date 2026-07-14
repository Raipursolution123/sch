import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  VehicleRouteAssignment,
  CreateVehicleRouteAssignmentPayload,
  UpdateVehicleRouteAssignmentPayload,
} from '@app-types/index';
import { type BackendPayload, extractList } from '@utils/api-response';

export const vehicleRoutesService = {
  list: async (): Promise<VehicleRouteAssignment[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.transport.assignVehicles);
    return extractList<VehicleRouteAssignment>(data);
  },

  create: async (payload: CreateVehicleRouteAssignmentPayload): Promise<VehicleRouteAssignment> => {
    const { data } = await apiClient.post<ApiSuccessResponse<VehicleRouteAssignment>>(
      API_ENDPOINTS.transport.assignVehicles,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateVehicleRouteAssignmentPayload): Promise<VehicleRouteAssignment> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<VehicleRouteAssignment>>(
      API_ENDPOINTS.transport.assignVehicleDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.transport.assignVehicleDetail(id));
  },
};
