import { apiClient } from './client';
import type { FinancialReportResponse } from '@/types/financial-report';
import type { ApiSuccessResponse } from '@/types/api';

const BASE_PATH = '/fees/financial-report/';

export const financialReportService = {
  getFinancialReport: async (startDate: string, endDate: string) => {
    const response = await apiClient.get<ApiSuccessResponse<FinancialReportResponse>>(BASE_PATH, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data.data;
  },
};
