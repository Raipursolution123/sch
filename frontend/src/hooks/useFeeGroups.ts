import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { feeGroupsService } from '@services/api';
import type { CreateFeeGroupPayload, UpdateFeeGroupPayload } from '@app-types/fees/fee-group';
import { getApiErrorMessage } from '@utils/session';

export function useFeeGroups() {
  return useQuery({
    queryKey: queryKeys.fees.feeGroups.list(),
    queryFn: feeGroupsService.list,
  });
}

export function useCreateFeeGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeeGroupPayload) => feeGroupsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee group created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create fee group')),
  });
}

export function useUpdateFeeGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFeeGroupPayload }) =>
      feeGroupsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee group updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update fee group')),
  });
}

export function useDeleteFeeGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeGroupsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee group deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete fee group')),
  });
}
