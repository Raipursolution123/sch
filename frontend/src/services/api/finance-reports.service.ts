import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type { TrialBalanceRow } from '@app-types/finance';
import { extractList } from '@utils/api-response';

export const financeReportsService = {
  getTrialBalance: async (): Promise<TrialBalanceRow[]> => {
    const response = await apiClient.get<ApiSuccessResponse<TrialBalanceRow[]>>(
      API_ENDPOINTS.finance.trialBalance,
    );
    return extractList<TrialBalanceRow>(response.data.data as unknown as Record<string, unknown>);
  },
};
