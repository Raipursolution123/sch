import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { feeDiscountsService } from '@services/api';
import type {
  CreateFeeDiscountPayload,
  UpdateFeeDiscountPayload,
} from '@app-types/fees/fee-discount';
import { getApiErrorMessage } from '@utils/session';

export function useFeeDiscounts() {
  return useQuery({
    queryKey: queryKeys.fees.discounts.list(),
    queryFn: feeDiscountsService.list,
  });
}

export function useCreateFeeDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeeDiscountPayload) => feeDiscountsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee discount created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create fee discount')),
  });
}

export function useUpdateFeeDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFeeDiscountPayload }) =>
      feeDiscountsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee discount updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update fee discount')),
  });
}

export function useDeleteFeeDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeDiscountsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee discount deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete fee discount')),
  });
}
