import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { feeMapperService } from '@services/api';
import type { FeeHeadMapperPayload, FeeHeadMapperUpdatePayload } from '@app-types/finance';
import { getApiErrorMessage } from '@utils/session';

export function useFeeMapper() {
  return useQuery({
    queryKey: queryKeys.finance.mapper.list(),
    queryFn: () => feeMapperService.list(),
  });
}

export function useCreateFeeMapper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FeeHeadMapperPayload) => feeMapperService.create(payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.finance.mapper.all });
      toast.success(response.message || 'Mapper created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create mapper')),
  });
}

export function useUpdateFeeMapper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FeeHeadMapperUpdatePayload }) =>
      feeMapperService.update(id, payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.finance.mapper.all });
      toast.success(response.message || 'Mapper updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update mapper')),
  });
}

export function useDeleteFeeMapper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeMapperService.delete(id),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.finance.mapper.all });
      toast.success(response.message || 'Mapper deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete mapper')),
  });
}
