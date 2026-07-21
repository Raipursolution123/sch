import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { REFERENCE_DATA_STALE_TIME } from '@constants/query-stale-times';
import { journalEntriesService } from '@services/api';
import type { JournalEntryCreatePayload } from '@app-types/finance';
import { getApiErrorMessage } from '@utils/session';

export function useEntryTypes() {
  return useQuery({
    queryKey: queryKeys.finance.entryTypes(),
    queryFn: () => journalEntriesService.listEntryTypes(),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useJournalEntries(page = 1) {
  return useQuery({
    queryKey: queryKeys.finance.entries.list(page),
    queryFn: () => journalEntriesService.list(page),
    placeholderData: keepPreviousData,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JournalEntryCreatePayload) => journalEntriesService.create(payload),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.finance.entries.all });
      toast.success(response.message || 'Journal entry created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create journal entry')),
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => journalEntriesService.delete(id),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.finance.entries.all });
      toast.success(response.message || 'Journal entry deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete journal entry')),
  });
}
