import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreatePostalRecordPayload,
  PostalRecord,
  UpdatePostalRecordPayload,
} from '@app-types/front-office/postal';
import { type BackendPayload, extractList } from '@utils/api-response';

export const postalService = {
  list: async (): Promise<PostalRecord[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.frontOffice.postal);
    return extractList<PostalRecord>(data);
  },

  create: async (payload: CreatePostalRecordPayload): Promise<PostalRecord> => {
    const { data } = await apiClient.post<ApiSuccessResponse<PostalRecord>>(
      API_ENDPOINTS.frontOffice.postal,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdatePostalRecordPayload): Promise<PostalRecord> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<PostalRecord>>(
      API_ENDPOINTS.frontOffice.postalDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.frontOffice.postalDetail(id));
  },
};
