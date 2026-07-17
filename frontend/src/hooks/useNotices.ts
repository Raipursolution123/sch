import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { noticesService } from '@services/api';
import type { CreateNoticePayload, UpdateNoticePayload } from '@app-types/communications/notice';
import { getApiErrorMessage } from '@utils/session';

export function useNotices() {
  return useQuery({
    queryKey: queryKeys.communications.notices.list(),
    queryFn: noticesService.list,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNoticePayload) => noticesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.communications.all });
      toast.success('Notice created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create notice')),
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateNoticePayload }) =>
      noticesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.communications.all });
      toast.success('Notice updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update notice')),
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => noticesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.communications.all });
      toast.success('Notice deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete notice')),
  });
}
