import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import {
  approveLeaveService,
  type ApproveLeave,
  type CreateApproveLeavePayload,
  type ApproveLeaveUpdatePayload,
} from '@services/api/approve-leave.service';

export const useApproveLeaves = (page: number = 1) => {
  return useQuery<{ results: ApproveLeave[]; count: number; next: string | null; previous: string | null }>({
    queryKey: [...queryKeys.attendance.approveLeave.list(), page],
    queryFn: () => approveLeaveService.list(page),
    placeholderData: keepPreviousData,
  });
};

export const useCreateApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApproveLeavePayload) => approveLeaveService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.approveLeave.all });
      toast.success('Leave request created successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create leave request';
      toast.error(message);
    },
  });
};

export const useUpdateApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApproveLeaveUpdatePayload }) =>
      approveLeaveService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.approveLeave.all });
      toast.success('Leave request updated successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update leave request';
      toast.error(message);
    },
  });
};

export const useDeleteApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveLeaveService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.approveLeave.all });
      toast.success('Leave request deleted successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to delete leave request';
      toast.error(message);
    },
  });
};
