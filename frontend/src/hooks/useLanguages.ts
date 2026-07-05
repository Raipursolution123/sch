import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { languagesService } from '@services/api';
import type { CreateLanguagePayload, UpdateLanguagePayload } from '@app-types/settings/language';
import { getApiErrorMessage } from '@utils/session';

export function useLanguages(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.settings.languages.list(page),
    queryFn: () => languagesService.list(page),
  });
}

export function useCreateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLanguagePayload) => languagesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.languages.all });
      toast.success('Language created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create language')),
  });
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLanguagePayload }) =>
      languagesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.languages.all });
      toast.success('Language updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update language')),
  });
}

export function useDeleteLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => languagesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.languages.all });
      toast.success('Language deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete language')),
  });
}
