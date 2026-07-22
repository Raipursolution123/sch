import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService } from '@/services/api';
import type { EmailConfigUpdatePayload } from '@/types/settings/email';
import { toast } from 'sonner';

export const useEmailSettings = () => {
  return useQuery({
    queryKey: ['email-settings'],
    queryFn: () => emailService.getConfig(),
  });
};

export const useUpdateEmailSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmailConfigUpdatePayload) => emailService.updateConfig(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Email settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update Email settings');
    },
  });
};
