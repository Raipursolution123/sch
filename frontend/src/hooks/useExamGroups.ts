import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { examGroupsService } from '@services/api';
import type { CreateExamGroupPayload, UpdateExamGroupPayload } from '@app-types/examinations/exam-group';
import { getApiErrorMessage } from '@utils/session';

export function useExamGroups() {
  return useQuery({
    queryKey: queryKeys.examinations.groups.list(),
    queryFn: examGroupsService.list,
  });
}

export function useCreateExamGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExamGroupPayload) => examGroupsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Exam group created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create exam group')),
  });
}

export function useUpdateExamGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateExamGroupPayload }) =>
      examGroupsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Exam group updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update exam group')),
  });
}

export function useDeleteExamGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examGroupsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Exam group deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete exam group')),
  });
}
