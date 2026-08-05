import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { PublicBranding } from '@app-types/settings/branding';

export const brandingService = {
  get: async (): Promise<PublicBranding> => {
    const { data } = await apiClient.get<ApiSuccessResponse<PublicBranding>>(
      API_ENDPOINTS.settings.branding,
    );
    return data.data;
  },
};
