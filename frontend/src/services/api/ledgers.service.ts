import { apiClient } from './client';
import type { Ledger, LedgerCreatePayload, LedgerUpdatePayload } from '@/types/finance';
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api';

const BASE_PATH = '/finance/ledgers/';

export const ledgersService = {
  getLedgers: async (page = 1) => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<Ledger>>>(BASE_PATH, {
      params: { page },
    });
    return response.data.data;
  },

  createLedger: async (data: LedgerCreatePayload) => {
    const response = await apiClient.post<{ data: Ledger; message: string }>(BASE_PATH, data);
    return response.data;
  },

  updateLedger: async (id: number, data: LedgerUpdatePayload) => {
    const response = await apiClient.put<{ data: Ledger; message: string }>(
      `${BASE_PATH}${id}/`,
      data,
    );
    return response.data;
  },

  deleteLedger: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(`${BASE_PATH}${id}/`);
    return response.data;
  },
};
