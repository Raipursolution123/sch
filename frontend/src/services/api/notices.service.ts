import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  CreateNoticePayload,
  Notice,
  UpdateNoticePayload,
} from '@app-types/communications/notice';
import { type BackendPayload, extractList } from '@utils/api-response';

export const noticesService = {
  list: async (): Promise<Notice[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.communications.notices);
    return extractList<Notice>(data);
  },

  create: async (payload: CreateNoticePayload): Promise<Notice> => {
    const { data } = await apiClient.post<ApiSuccessResponse<Notice>>(
      API_ENDPOINTS.communications.notices,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateNoticePayload): Promise<Notice> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<Notice>>(
      API_ENDPOINTS.communications.noticeDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.communications.noticeDetail(id));
  },
};
