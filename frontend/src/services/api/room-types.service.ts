import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateRoomTypePayload,
  RoomType,
  UpdateRoomTypePayload,
} from '@app-types/hostel/room-type';
import { type BackendPayload, extractList } from '@utils/api-response';

export const roomTypesService = {
  list: async (): Promise<RoomType[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.hostel.roomTypes);
    return extractList<RoomType>(data);
  },

  create: async (payload: CreateRoomTypePayload): Promise<RoomType> => {
    const { data } = await apiClient.post<ApiSuccessResponse<RoomType>>(
      API_ENDPOINTS.hostel.roomTypes,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateRoomTypePayload): Promise<RoomType> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<RoomType>>(
      API_ENDPOINTS.hostel.roomTypeDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.hostel.roomTypeDetail(id));
  },
};
