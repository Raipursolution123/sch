import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalEntriesService } from '@/services/api';
import { toast } from 'sonner';
import type { JournalEntryCreatePayload } from '@/types/finance';

export const useJournalEntries = (page = 1) => {
  return useQuery({
    queryKey: ['journal-entries', page],
    queryFn: () => journalEntriesService.getEntries(page),
  });
};

export const useJournalEntry = (id: number) => {
  return useQuery({
    queryKey: ['journal-entries', id],
    queryFn: () => journalEntriesService.getEntry(id),
    enabled: !!id,
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JournalEntryCreatePayload) => journalEntriesService.createEntry(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Journal entry created successfully');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create journal entry');
    },
  });
};

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => journalEntriesService.deleteEntry(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Journal entry deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete journal entry');
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: JournalEntryCreatePayload }) =>
      journalEntriesService.updateEntry(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Journal entry updated successfully');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update journal entry');
    },
  });
};
