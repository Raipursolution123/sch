import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ledgerGroupsService } from '@/services/api';
import type { LedgerGroupCreatePayload, LedgerGroupUpdatePayload } from '@/types/finance';
import { toast } from 'sonner';

export const LEDGER_GROUPS_KEYS = {
  all: ['ledger_groups'] as const,
  lists: () => [...LEDGER_GROUPS_KEYS.all, 'list'] as const,
  list: (page: number) => [...LEDGER_GROUPS_KEYS.lists(), { page }] as const,
};

export const useLedgerGroupsList = (page = 1) => {
  return useQuery({
    queryKey: LEDGER_GROUPS_KEYS.list(page),
    queryFn: () => ledgerGroupsService.getGroups(page),
    placeholderData: keepPreviousData,
  });
};

export const useLedgerGroups = () => {
  return useQuery({
    queryKey: LEDGER_GROUPS_KEYS.lists(),
    queryFn: () => ledgerGroupsService.getAllGroups(),
  });
};

export const useCreateLedgerGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LedgerGroupCreatePayload) => ledgerGroupsService.createGroup(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Ledger Group created successfully');
      queryClient.invalidateQueries({ queryKey: LEDGER_GROUPS_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create ledger group');
    },
  });
};

export const useUpdateLedgerGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LedgerGroupUpdatePayload }) =>
      ledgerGroupsService.updateGroup(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Ledger Group updated successfully');
      queryClient.invalidateQueries({ queryKey: LEDGER_GROUPS_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update ledger group');
    },
  });
};

export const useDeleteLedgerGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ledgerGroupsService.deleteGroup(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Ledger Group deleted successfully');
      queryClient.invalidateQueries({ queryKey: LEDGER_GROUPS_KEYS.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete ledger group');
    },
  });
};
