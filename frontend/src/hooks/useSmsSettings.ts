import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smsService } from '@/services/api';
import type { SmsConfigUpdatePayload } from '@/types/settings/sms';
import { toast } from 'sonner';

export const useSmsSettings = () => {
  return useQuery({
    queryKey: ['sms-settings'],
    queryFn: () => smsService.getConfigs(),
  });
};

export const useUpdateSmsSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SmsConfigUpdatePayload }) =>
      smsService.updateConfig(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'SMS settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['sms-settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update SMS settings');
    },
  });
};
