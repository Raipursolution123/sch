import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse, PaginatedResponse } from '@app-types/api';
import type {
  OfflineBankPayment,
  OfflineBankPaymentActionPayload,
  OfflineBankPaymentFilters,
} from '@app-types/fees/offline-bank-payment';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';

function toPaginated<T>(data: BackendPayload): PaginatedResponse<T> {
  const results = extractList<T>(data);
  return {
    results,
    count: extractCount(data, results.length),
    next: typeof data.next === 'string' ? data.next : null,
    previous: typeof data.previous === 'string' ? data.previous : null,
  };
}

export const offlineBankPaymentsService = {
  list: async (
    filters: OfflineBankPaymentFilters = {},
  ): Promise<PaginatedResponse<OfflineBankPayment>> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.fees.offlinePayments, {
      params: {
        status: filters.status ?? 'pending',
        ...(filters.from_date ? { from_date: filters.from_date } : {}),
        ...(filters.to_date ? { to_date: filters.to_date } : {}),
        ...(filters.q?.trim() ? { q: filters.q.trim() } : {}),
        page: filters.page ?? 1,
      },
    });
    // List endpoint uses StandardResultsSetPagination (flat count/results), not APIResponse.data.
    return toPaginated<OfflineBankPayment>(data);
  },

  approve: async (
    id: number,
    payload: OfflineBankPaymentActionPayload = {},
  ): Promise<OfflineBankPayment> => {
    const { data } = await apiClient.post<ApiSuccessResponse<OfflineBankPayment>>(
      API_ENDPOINTS.fees.offlinePaymentApprove(id),
      payload,
    );
    return data.data;
  },

  reject: async (
    id: number,
    payload: OfflineBankPaymentActionPayload = {},
  ): Promise<OfflineBankPayment> => {
    const { data } = await apiClient.post<ApiSuccessResponse<OfflineBankPayment>>(
      API_ENDPOINTS.fees.offlinePaymentReject(id),
      payload,
    );
    return data.data;
  },
};
