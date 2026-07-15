import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { FeeReminder, UpdateFeeReminderPayload } from '@app-types/fees/fee-reminder';
import { type BackendPayload, extractList } from '@utils/api-response';

export const feeRemindersService = {
  list: async (): Promise<FeeReminder[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.reminders);
    return extractList<FeeReminder>(data);
  },

  update: async (id: number, payload: UpdateFeeReminderPayload): Promise<FeeReminder> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<FeeReminder>>(
      API_ENDPOINTS.fees.reminderDetail(id),
      payload,
    );
    return data.data;
  },
};
