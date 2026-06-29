import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { feeTypesService } from '@services/api';
import type { CreateFeeTypePayload, UpdateFeeTypePayload } from '@app-types/fees/fee-type';
import { getApiErrorMessage } from '@utils/session';

export function useFeeTypes() {
  return useQuery({
    queryKey: queryKeys.fees.feeTypes.list(),
    queryFn: feeTypesService.list,
  });
}

export function useFeeCategories() {
  return useQuery({
    queryKey: queryKeys.fees.categories(),
    queryFn: feeTypesService.listCategories,
  });
}

export function useCreateFeeType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeeTypePayload) => feeTypesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee type created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create fee type')),
  });
}

export function useUpdateFeeType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFeeTypePayload }) =>
      feeTypesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee type updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update fee type')),
  });
}

export function useDeleteFeeType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeTypesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee type deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete fee type')),
  });
}
