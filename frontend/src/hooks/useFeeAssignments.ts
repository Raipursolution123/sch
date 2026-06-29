import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { feeAssignmentsService } from '@services/api';
import type {
  CreateFeeAssignmentPayload,
  UpdateFeeAssignmentPayload,
} from '@app-types/fees/fee-assignment';
import { getApiErrorMessage } from '@utils/session';

export function useFeeAssignments() {
  return useQuery({
    queryKey: queryKeys.fees.assignments.list(),
    queryFn: feeAssignmentsService.list,
  });
}

export function useCreateFeeAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeeAssignmentPayload) => feeAssignmentsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee assignment created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create fee assignment')),
  });
}

export function useUpdateFeeAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFeeAssignmentPayload }) =>
      feeAssignmentsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee assignment updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update fee assignment')),
  });
}

export function useDeleteFeeAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeAssignmentsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee assignment deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete fee assignment')),
  });
}
