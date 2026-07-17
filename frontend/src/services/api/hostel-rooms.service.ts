import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateHostelRoomPayload,
  HostelRoom,
  UpdateHostelRoomPayload,
} from '@app-types/hostel/hostel-room';
import { type BackendPayload, extractList } from '@utils/api-response';

export const hostelRoomsService = {
  list: async (hostelId?: number): Promise<HostelRoom[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.hostel.rooms, {
      params: hostelId != null ? { hostel_id: hostelId } : undefined,
    });
    return extractList<HostelRoom>(data);
  },

  create: async (payload: CreateHostelRoomPayload): Promise<HostelRoom> => {
    const { data } = await apiClient.post<ApiSuccessResponse<HostelRoom>>(
      API_ENDPOINTS.hostel.rooms,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateHostelRoomPayload): Promise<HostelRoom> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<HostelRoom>>(
      API_ENDPOINTS.hostel.roomDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.hostel.roomDetail(id));
  },
};
