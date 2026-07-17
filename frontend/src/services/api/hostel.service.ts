import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { CreateHostelPayload, Hostel, UpdateHostelPayload } from '@app-types/hostel/hostel';
import { type BackendPayload, extractList } from '@utils/api-response';

export const hostelService = {
  list: async (): Promise<Hostel[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.hostel.hostels);
    return extractList<Hostel>(data);
  },

  create: async (payload: CreateHostelPayload): Promise<Hostel> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Hostel>>(
      API_ENDPOINTS.hostel.hostels,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateHostelPayload): Promise<Hostel> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<Hostel>>(
      API_ENDPOINTS.hostel.hostelDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.hostel.hostelDetail(id));
  },
};
