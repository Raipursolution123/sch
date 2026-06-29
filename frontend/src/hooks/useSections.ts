import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { sectionsService } from '@services/api';
import type { CreateSectionPayload, UpdateSectionPayload } from '@app-types/academics/section';
import { getApiErrorMessage } from '@utils/session';

export function useSections() {
  return useQuery({
    queryKey: queryKeys.academics.sections.list(),
    queryFn: sectionsService.list,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSectionPayload) => sectionsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.sections.all });
      toast.success('Section created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create section')),
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSectionPayload }) =>
      sectionsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.sections.all });
      toast.success('Section updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update section')),
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sectionsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.sections.all });
      toast.success('Section deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete section')),
  });
}
