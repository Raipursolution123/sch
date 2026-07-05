import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { classSectionsService } from '@services/api';
import type {
  CreateClassSectionPayload,
  UpdateClassSectionPayload,
} from '@app-types/academics/class-section';
import { getApiErrorMessage } from '@utils/session';

export function useClassSections(page: number = 1) {
  return useQuery({
    queryKey: [...queryKeys.academics.classSections.list(), page],
    queryFn: () => classSectionsService.list(page),
  });
}

export function useCreateClassSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassSectionPayload) => classSectionsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.classSections.all });
      toast.success('Class section created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create class section')),
  });
}

export function useUpdateClassSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateClassSectionPayload }) =>
      classSectionsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.classSections.all });
      toast.success('Class section updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update class section')),
  });
}

export function useDeleteClassSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classSectionsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.classSections.all });
      toast.success('Class section deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete class section')),
  });
}
