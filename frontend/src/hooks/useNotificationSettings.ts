import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationSettingsService } from '@/services/api';
import type { NotificationSettingUpdatePayload } from '@/types/settings/notifications';
import { toast } from 'sonner';

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => notificationSettingsService.getSettings(),
  });
};

export const useUpdateNotificationSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NotificationSettingUpdatePayload }) =>
      notificationSettingsService.updateSetting(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Notification settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update Notification settings');
    },
  });
};
