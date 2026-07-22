import { apiClient } from './client';
import type { SmsConfig, SmsConfigUpdatePayload } from '@/types/settings/sms';
import type { ApiSuccessResponse } from '@/types/api';

const BASE_PATH = '/settings/sms/';

export const smsService = {
  getConfigs: async () => {
    const response = await apiClient.get<ApiSuccessResponse<SmsConfig[]>>(BASE_PATH);
    return response.data.data;
  },

  updateConfig: async (id: number, data: SmsConfigUpdatePayload) => {
    const response = await apiClient.put<{ data: SmsConfig; message: string }>(`${BASE_PATH}${id}/`, data);
    return response.data;
  },
};
