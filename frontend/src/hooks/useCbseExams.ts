import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { cbseExamsService } from '@services/api';
import type { CreateCbseExamPayload, UpdateCbseExamPayload } from '@app-types/examinations/cbse-exam';
import { getApiErrorMessage } from '@utils/session';

export function useCbseExams() {
  return useQuery({
    queryKey: queryKeys.examinations.cbseExams.list(),
    queryFn: cbseExamsService.list,
  });
}

export function useCreateCbseExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCbseExamPayload) => cbseExamsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.cbseExams.list() });
      toast.success('CBSE exam created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create CBSE exam')),
  });
}

export function useUpdateCbseExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCbseExamPayload }) =>
      cbseExamsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.cbseExams.list() });
      toast.success('CBSE exam updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update CBSE exam')),
  });
}

export function useDeleteCbseExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cbseExamsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.cbseExams.list() });
      toast.success('CBSE exam deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete CBSE exam')),
  });
}
