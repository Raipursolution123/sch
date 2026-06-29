import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { examsService } from '@services/api';
import type { CreateExamPayload, UpdateExamPayload } from '@app-types/examinations/exam';
import { getApiErrorMessage } from '@utils/session';

export function useExams() {
  return useQuery({
    queryKey: queryKeys.examinations.exams.list(),
    queryFn: examsService.list,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExamPayload) => examsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Exam created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create exam')),
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateExamPayload }) =>
      examsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Exam updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update exam')),
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Exam deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete exam')),
  });
}
