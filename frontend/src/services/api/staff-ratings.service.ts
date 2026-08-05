import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import { type BackendPayload, extractList } from '@utils/api-response';

export interface StaffRating {
  id: number;
  staff_id: number;
  staff_name: string;
  comment: string;
  rate: number;
  user_id: number;
  role: string;
  status: number;
  status_label: string;
  entrydt: string | null;
}

export const staffRatingsService = {
  list: async (status?: number): Promise<StaffRating[]> => {
    const qs = status === undefined ? '' : `?status=${status}`;
    const { data } = await apiClient.get<BackendPayload>(`${API_ENDPOINTS.staff.ratings}${qs}`);
    return extractList<StaffRating>(data);
  },

  approve: async (id: number): Promise<StaffRating> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffRating>>(
      API_ENDPOINTS.staff.ratingApprove(id),
    );
    return data.data;
  },

  decline: async (id: number): Promise<StaffRating> => {
    const { data } = await apiClient.post<ApiSuccessResponse<StaffRating>>(
      API_ENDPOINTS.staff.ratingDecline(id),
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.staff.ratingDetail(id));
  },
};
