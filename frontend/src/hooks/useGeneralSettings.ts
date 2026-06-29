import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { generalSettingsService } from '@services/api/general-settings.service';
import type { GeneralSettingsUpdatePayload } from '@app-types/settings/general';
import { getApiErrorMessage } from '@utils/session';

export function useGeneralSettings() {
  return useQuery({
    queryKey: queryKeys.settings.general.detail(),
    queryFn: generalSettingsService.get,
  });
}

export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GeneralSettingsUpdatePayload) => generalSettingsService.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.general.all });
      toast.success('Settings saved successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save settings')),
  });
}
