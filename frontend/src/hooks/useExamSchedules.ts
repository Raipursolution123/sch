import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { examSchedulesService } from '@services/api';
import type {
  CreateExamSchedulePayload,
  UpdateExamSchedulePayload,
} from '@app-types/examinations/exam-schedule';
import { getApiErrorMessage } from '@utils/session';

export function useExamSchedules() {
  return useQuery({
    queryKey: queryKeys.examinations.schedules.list(),
    queryFn: examSchedulesService.list,
  });
}

export function useCreateExamSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExamSchedulePayload) => examSchedulesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Exam schedule created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create schedule')),
  });
}

export function useUpdateExamSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateExamSchedulePayload }) =>
      examSchedulesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Exam schedule updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update schedule')),
  });
}

export function useDeleteExamSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examSchedulesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Exam schedule deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete schedule')),
  });
}
