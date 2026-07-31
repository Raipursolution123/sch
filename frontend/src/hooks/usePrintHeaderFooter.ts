import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { printHeaderFooterService } from '@/services/api';
import type {
  PrintHeaderFooterCreatePayload,
  PrintHeaderFooterUpdatePayload,
} from '@/types/settings/print-header-footer';
import { toast } from 'sonner';

export const usePrintHeaderFooterList = () => {
  return useQuery({
    queryKey: ['print-header-footers'],
    queryFn: () => printHeaderFooterService.list(),
  });
};

export const useCreatePrintHeaderFooter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PrintHeaderFooterCreatePayload) =>
      printHeaderFooterService.create(data),
    onSuccess: () => {
      toast.success('Print template created successfully');
      queryClient.invalidateQueries({ queryKey: ['print-header-footers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create print template');
    },
  });
};

export const useUpdatePrintHeaderFooter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PrintHeaderFooterUpdatePayload }) =>
      printHeaderFooterService.update(id, data),
    onSuccess: () => {
      toast.success('Print template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['print-header-footers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update print template');
    },
  });
};

export const useDeletePrintHeaderFooter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => printHeaderFooterService.delete(id),
    onSuccess: () => {
      toast.success('Print template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['print-header-footers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete print template');
    },
  });
};
