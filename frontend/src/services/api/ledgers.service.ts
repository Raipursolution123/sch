import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/index';
import type { Ledger, LedgerCreatePayload, LedgerUpdatePayload } from '@app-types/finance';
import type { ApiSuccessResponse, PaginatedResponse } from '@app-types/api';

export const ledgersService = {
  getLedgers: async (page = 1, pageSize = 20) => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<Ledger>>>(
      API_ENDPOINTS.finance.ledgers,
      { params: { page, page_size: pageSize } },
    );
    return response.data.data;
  },

  createLedger: async (data: LedgerCreatePayload) => {
    const response = await apiClient.post<{ data: Ledger; message: string }>(
      API_ENDPOINTS.finance.ledgers,
      data,
    );
    return response.data;
  },

  updateLedger: async (id: number, data: LedgerUpdatePayload) => {
    const response = await apiClient.put<{ data: Ledger; message: string }>(
      API_ENDPOINTS.finance.ledgerDetail(id),
      data,
    );
    return response.data;
  },

  deleteLedger: async (id: number) => {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.finance.ledgerDetail(id),
    );
    return response.data;
  },
};
