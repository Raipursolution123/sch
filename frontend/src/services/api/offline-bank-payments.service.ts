import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse, PaginatedResponse } from '@app-types/api';
import type {
  OfflineBankPayment,
  OfflineBankPaymentActionPayload,
  OfflineBankPaymentFilters,
} from '@app-types/fees/offline-bank-payment';

export const offlineBankPaymentsService = {
  list: async (
    filters: OfflineBankPaymentFilters = {},
  ): Promise<PaginatedResponse<OfflineBankPayment>> => {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<OfflineBankPayment>>>(
      API_ENDPOINTS.fees.offlinePayments,
      {
        params: {
          status: filters.status ?? 'pending',
          ...(filters.from_date ? { from_date: filters.from_date } : {}),
          ...(filters.to_date ? { to_date: filters.to_date } : {}),
          ...(filters.q?.trim() ? { q: filters.q.trim() } : {}),
          page: filters.page ?? 1,
        },
      },
    );
    return response.data.data;
  },

  approve: async (id: number, payload: OfflineBankPaymentActionPayload = {}) => {
    const response = await apiClient.post<{ data: OfflineBankPayment; message: string }>(
      API_ENDPOINTS.fees.offlinePaymentApprove(id),
      payload,
    );
    return response.data;
  },

  reject: async (id: number, payload: OfflineBankPaymentActionPayload = {}) => {
    const response = await apiClient.post<{ data: OfflineBankPayment; message: string }>(
      API_ENDPOINTS.fees.offlinePaymentReject(id),
      payload,
    );
    return response.data;
  },
};
