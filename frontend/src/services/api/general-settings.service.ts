import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { GeneralSettings, GeneralSettingsUpdatePayload } from '@app-types/settings/general';

export const generalSettingsService = {
  get: async (): Promise<GeneralSettings> => {
    const { data } = await apiClient.get<ApiSuccessResponse<GeneralSettings>>(
      API_ENDPOINTS.settings.general,
    );
    return data.data;
  },

  update: async (payload: GeneralSettingsUpdatePayload): Promise<GeneralSettings> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<GeneralSettings>>(
      API_ENDPOINTS.settings.general,
      payload,
    );
    return data.data;
  },
};
