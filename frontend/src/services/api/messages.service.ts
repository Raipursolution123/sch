import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  BulkEmailPayload,
  CommunicationMessage,
  ComposeMessagePayload,
  MessageChannel,
} from '@app-types/communications/messages';
import { type BackendPayload, extractList } from '@utils/api-response';

export const messagesService = {
  list: async (channel?: MessageChannel): Promise<CommunicationMessage[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.communications.messages, {
      params: { page_size: 50, ...(channel ? { channel } : {}) },
    });
    return extractList<CommunicationMessage>(data);
  },

  composeEmail: async (payload: ComposeMessagePayload): Promise<CommunicationMessage> => {
    const { data } = await apiClient.post<ApiSuccessResponse<CommunicationMessage>>(
      API_ENDPOINTS.communications.composeEmail,
      payload,
    );
    return data.data;
  },

  composeSms: async (payload: ComposeMessagePayload): Promise<CommunicationMessage> => {
    const { data } = await apiClient.post<ApiSuccessResponse<CommunicationMessage>>(
      API_ENDPOINTS.communications.composeSms,
      payload,
    );
    return data.data;
  },

  bulkEmail: async (payload: BulkEmailPayload): Promise<CommunicationMessage> => {
    const { data } = await apiClient.post<ApiSuccessResponse<CommunicationMessage>>(
      API_ENDPOINTS.communications.bulkEmail,
      payload,
    );
    return data.data;
  },
};
