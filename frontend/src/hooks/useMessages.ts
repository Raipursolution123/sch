import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { messagesService } from '@services/api/messages.service';
import type {
  BulkEmailPayload,
  ComposeMessagePayload,
  MessageChannel,
} from '@app-types/communications/messages';
import { getApiErrorMessage } from '@utils/session';

export function useCommunicationMessages(channel?: MessageChannel) {
  return useQuery({
    queryKey: queryKeys.communications.messages.list(channel),
    queryFn: () => messagesService.list(channel),
  });
}

export function useComposeEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ComposeMessagePayload) => messagesService.composeEmail(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.communications.messages.all });
      toast.success('Email queued (delivery when SMTP is configured)');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to queue email')),
  });
}

export function useComposeSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ComposeMessagePayload) => messagesService.composeSms(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.communications.messages.all });
      toast.success('SMS queued (delivery when gateway is configured)');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to queue SMS')),
  });
}

export function useBulkEmailStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkEmailPayload) => messagesService.bulkEmail(payload),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: queryKeys.communications.messages.all });
      toast.success(
        `Bulk email queued for ${data.recipient_count ?? 0} recipients (delivery when SMTP is configured)`,
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to queue bulk email')),
  });
}
