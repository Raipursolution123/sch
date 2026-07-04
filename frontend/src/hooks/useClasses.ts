import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { classesService } from '@services/api';
import type { CreateClassPayload, UpdateClassPayload } from '@app-types/academics/class';
import { getApiErrorMessage } from '@utils/session';

export function useClasses(page: number = 1) {
  return useQuery({
    queryKey: [...queryKeys.academics.classes.list(), page],
    queryFn: () => classesService.list(page),
  });
}

export function useSuggestedClassSortOrder(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.academics.classes.suggestSortOrder(),
    queryFn: classesService.suggestSortOrder,
    enabled,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassPayload) => classesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.classes.all });
      toast.success('Class created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create class')),
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateClassPayload }) =>
      classesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.classes.all });
      toast.success('Class updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update class')),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.classes.all });
      toast.success('Class deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete class')),
  });
}
