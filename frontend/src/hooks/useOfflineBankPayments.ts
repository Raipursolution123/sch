import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { offlineBankPaymentsService } from '@services/api';
import type {
  OfflineBankPaymentActionPayload,
  OfflineBankPaymentFilters,
} from '@app-types/fees/offline-bank-payment';
import { getApiErrorMessage } from '@utils/session';

export function useOfflineBankPayments(filters: OfflineBankPaymentFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.fees.offlinePayments.list(filters),
    queryFn: () => offlineBankPaymentsService.list(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useApproveOfflineBankPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: OfflineBankPaymentActionPayload }) =>
      offlineBankPaymentsService.approve(id, payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.offlinePayments.all });
      toast.success(response.message || 'Payment approved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to approve offline payment')),
  });
}

export function useRejectOfflineBankPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: OfflineBankPaymentActionPayload }) =>
      offlineBankPaymentsService.reject(id, payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.offlinePayments.all });
      toast.success(response.message || 'Payment rejected');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to reject offline payment')),
  });
}
