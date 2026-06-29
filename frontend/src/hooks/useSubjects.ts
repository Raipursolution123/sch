import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { subjectsService } from '@services/api';
import type { CreateSubjectPayload, UpdateSubjectPayload } from '@app-types/academics/subject';
import { getApiErrorMessage } from '@utils/session';

export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.academics.subjects.list(),
    queryFn: subjectsService.list,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) => subjectsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.subjects.all });
      toast.success('Subject created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create subject')),
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSubjectPayload }) =>
      subjectsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.subjects.all });
      toast.success('Subject updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update subject')),
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subjectsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.subjects.all });
      toast.success('Subject deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete subject')),
  });
}
