import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { staffLeaveRequestsService } from '@services/api';
import type {
  CreateStaffLeaveRequestPayload,
  ReviewStaffLeavePayload,
} from '@app-types/staff/leave-request';
import { getApiErrorMessage } from '@utils/session';

export function useStaffLeaveRequests() {
  return useQuery({
    queryKey: queryKeys.staff.leaveRequests.list(),
    queryFn: staffLeaveRequestsService.list,
  });
}

export function useCreateStaffLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffLeaveRequestPayload) =>
      staffLeaveRequestsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.leaveRequests.list() });
      toast.success('Leave request created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create leave request')),
  });
}

export function useReviewStaffLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReviewStaffLeavePayload }) =>
      staffLeaveRequestsService.review(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.leaveRequests.list() });
      toast.success(
        variables.payload.status === 'approved'
          ? 'Leave request approved'
          : 'Leave request rejected',
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to review leave request')),
  });
}
