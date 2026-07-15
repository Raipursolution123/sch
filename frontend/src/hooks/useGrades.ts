import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { gradesService } from '@services/api';
import type { CreateGradePayload, UpdateGradePayload } from '@app-types/examinations/grade';
import { getApiErrorMessage } from '@utils/session';

export function useGrades() {
  return useQuery({
    queryKey: queryKeys.examinations.grades.list(),
    queryFn: gradesService.list,
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGradePayload) => gradesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Grade created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create grade')),
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGradePayload }) =>
      gradesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Grade updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update grade')),
  });
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gradesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Grade deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete grade')),
  });
}
