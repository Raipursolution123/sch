import { apiClient } from './client';
import type {
  NotificationSetting,
  NotificationSettingUpdatePayload,
} from '@/types/settings/notifications';
import type { ApiSuccessResponse } from '@/types/api';

const BASE_PATH = '/settings/notifications/';

export const notificationSettingsService = {
  getSettings: async () => {
    const response = await apiClient.get<ApiSuccessResponse<NotificationSetting[]>>(BASE_PATH);
    return response.data.data;
  },

  updateSetting: async (id: number, data: NotificationSettingUpdatePayload) => {
    const response = await apiClient.put<{ data: NotificationSetting; message: string }>(
      `${BASE_PATH}${id}/`,
      data,
    );
    return response.data;
  },
};
