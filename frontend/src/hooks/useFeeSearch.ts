import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { feeSearchService } from '@services/api';
import type { FeeDueSearchFilters, FeePaymentSearchFilters } from '@app-types/fees/fee-search';

export function useFeeDueSearch(filters: FeeDueSearchFilters, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.fees.search.due(filters),
    queryFn: () => feeSearchService.searchDueFees(filters),
    enabled,
  });
}

export function useFeePaymentSearch(filters: FeePaymentSearchFilters, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.fees.search.payments(filters),
    queryFn: () => feeSearchService.searchPayments(filters),
    enabled: enabled && Boolean(filters.from_date) && Boolean(filters.to_date),
  });
}
