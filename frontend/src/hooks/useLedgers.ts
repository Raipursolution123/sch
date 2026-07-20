import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ledgersService } from '@/services/api';
import type { LedgerCreatePayload, LedgerUpdatePayload } from '@/types/finance';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@utils/session';

export const LEDGERS_KEYS = {
  all: ['ledgers'] as const,
  lists: () => [...LEDGERS_KEYS.all, 'list'] as const,
  list: (page: number) => [...LEDGERS_KEYS.lists(), { page }] as const,
};

export const useLedgersList = (page = 1) => {
  return useQuery({
    queryKey: LEDGERS_KEYS.list(page),
    queryFn: () => ledgersService.getLedgers(page),
    placeholderData: keepPreviousData,
  });
};

export const useCreateLedger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LedgerCreatePayload) => ledgersService.createLedger(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Ledger created successfully');
      queryClient.invalidateQueries({ queryKey: LEDGERS_KEYS.lists() });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create ledger')),
  });
};

export const useUpdateLedger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LedgerUpdatePayload }) =>
      ledgersService.updateLedger(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Ledger updated successfully');
      queryClient.invalidateQueries({ queryKey: LEDGERS_KEYS.lists() });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update ledger')),
  });
};

export const useDeleteLedger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ledgersService.deleteLedger(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Ledger deleted successfully');
      queryClient.invalidateQueries({ queryKey: LEDGERS_KEYS.lists() });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete ledger')),
  });
};
