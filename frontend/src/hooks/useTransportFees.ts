import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { transportFeesService } from '@services/api';
import type {
  CreateTransportFeeMasterPayload,
  UpdateTransportFeeMasterPayload,
} from '@app-types/transport';
import { getApiErrorMessage } from '@utils/session';

export function useTransportFees(sessionId?: number) {
  return useQuery({
    queryKey: queryKeys.transport.fees(sessionId),
    queryFn: () => transportFeesService.list(sessionId),
  });
}

export function useCreateTransportFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransportFeeMasterPayload) => transportFeesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Transport fee created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create transport fee')),
  });
}

export function useUpdateTransportFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTransportFeeMasterPayload }) =>
      transportFeesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Transport fee updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update transport fee')),
  });
}

export function useDeleteTransportFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transportFeesService.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Transport fee deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete transport fee')),
  });
}
