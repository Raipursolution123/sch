import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { printHeaderFooterService } from '@/services/api';
import type { PrintHeaderFooterCreatePayload, PrintHeaderFooterUpdatePayload } from '@/types/settings/print-header-footer';
import { toast } from 'sonner';

export const usePrintHeaderFooterList = () => {
  return useQuery({
    queryKey: ['print-header-footers'],
    queryFn: () => printHeaderFooterService.getTemplates(),
  });
};

export const useCreatePrintHeaderFooter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PrintHeaderFooterCreatePayload) => printHeaderFooterService.createTemplate(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Print template created successfully');
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
      printHeaderFooterService.updateTemplate(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Print template updated successfully');
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
    mutationFn: (id: number) => printHeaderFooterService.deleteTemplate(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Print template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['print-header-footers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete print template');
    },
  });
};
