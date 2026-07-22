import { apiClient } from './client';
import type { EmailConfig, EmailConfigUpdatePayload } from '@/types/settings/email';
import type { ApiSuccessResponse } from '@/types/api';

const BASE_PATH = '/settings/email/';

export const emailService = {
  getConfig: async () => {
    const response = await apiClient.get<ApiSuccessResponse<EmailConfig>>(BASE_PATH);
    return response.data.data;
  },

  updateConfig: async (data: EmailConfigUpdatePayload) => {
    const response = await apiClient.put<{ data: EmailConfig; message: string }>(BASE_PATH, data);
    return response.data;
  },
};
