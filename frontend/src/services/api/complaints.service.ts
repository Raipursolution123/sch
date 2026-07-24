import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  Complaint,
  CreateComplaintPayload,
  UpdateComplaintPayload,
} from '@app-types/front-office/complaint';
import { type BackendPayload, extractList } from '@utils/api-response';

export const complaintsService = {
  list: async (): Promise<Complaint[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.frontOffice.complaints);
    return extractList<Complaint>(data);
  },

  create: async (payload: CreateComplaintPayload): Promise<Complaint> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Complaint>>(
      API_ENDPOINTS.frontOffice.complaints,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateComplaintPayload): Promise<Complaint> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<Complaint>>(
      API_ENDPOINTS.frontOffice.complaintDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.frontOffice.complaintDetail(id));
  },
};
