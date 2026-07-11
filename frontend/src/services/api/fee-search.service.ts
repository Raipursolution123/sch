import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  FeeDueSearchFilters,
  FeeDueSearchResult,
  FeePaymentSearchFilters,
  FeePaymentSearchResult,
} from '@app-types/fees/fee-search';

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const feeSearchService = {
  searchDueFees: async (filters: FeeDueSearchFilters): Promise<FeeDueSearchResult> => {
    const { data } = await apiClient.get<ApiSuccessResponse<FeeDueSearchResult>>(
      `${API_ENDPOINTS.fees.searchDue}${buildQuery({
        class_id: filters.class_id,
        section_id: filters.section_id,
        q: filters.q,
        min_balance: filters.min_balance,
      })}`,
    );
    return data.data;
  },

  searchPayments: async (filters: FeePaymentSearchFilters): Promise<FeePaymentSearchResult> => {
    const { data } = await apiClient.get<ApiSuccessResponse<FeePaymentSearchResult>>(
      `${API_ENDPOINTS.fees.searchPayments}${buildQuery({
        from_date: filters.from_date,
        to_date: filters.to_date,
        class_id: filters.class_id,
        section_id: filters.section_id,
        q: filters.q,
        payment_mode: filters.payment_mode,
      })}`,
    );
    return data.data;
  },
};
