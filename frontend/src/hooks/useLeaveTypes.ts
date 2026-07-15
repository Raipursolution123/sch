import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { leaveTypesService } from '@services/api';
import type { CreateLeaveTypePayload, UpdateLeaveTypePayload } from '@app-types/staff/leave-type';
import { getApiErrorMessage } from '@utils/session';

export function useLeaveTypes() {
  return useQuery({
    queryKey: queryKeys.staff.leaveTypes.list(),
    queryFn: leaveTypesService.list,
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeaveTypePayload) => leaveTypesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Leave type created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create leave type')),
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLeaveTypePayload }) =>
      leaveTypesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Leave type updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update leave type')),
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveTypesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Leave type deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete leave type')),
  });
}
