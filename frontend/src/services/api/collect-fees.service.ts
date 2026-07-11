import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { FeeCollectRoster } from '@app-types/fees/fee-collect';

export const collectFeesService = {
  getRoster: async (classId: number, sectionId: number): Promise<FeeCollectRoster> => {
    const { data } = await apiClient.get<ApiSuccessResponse<FeeCollectRoster>>(
      `${API_ENDPOINTS.fees.collectRoster}?class_id=${classId}&section_id=${sectionId}`,
    );
    return data.data;
  },
};
