import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { feeRemindersService } from '@services/api';
import type { UpdateFeeReminderPayload } from '@app-types/fees/fee-reminder';
import { getApiErrorMessage } from '@utils/session';

export function useFeeReminders() {
  return useQuery({
    queryKey: queryKeys.fees.reminders.list(),
    queryFn: feeRemindersService.list,
  });
}

export function useUpdateFeeReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFeeReminderPayload }) =>
      feeRemindersService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.reminders.list() });
      toast.success('Fee reminder updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update fee reminder')),
  });
}
