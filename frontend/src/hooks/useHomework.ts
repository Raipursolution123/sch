import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { dailyAssignmentsService, homeworkService } from '@services/api';
import type {
  CreateDailyAssignmentPayload,
  CreateHomeworkPayload,
  DailyAssignmentListFilters,
  HomeworkListFilters,
  UpdateDailyAssignmentPayload,
  UpdateHomeworkPayload,
} from '@app-types/academics/homework';
import { getApiErrorMessage } from '@utils/session';

export function useHomeworkList(filters: HomeworkListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.homework.list(filters as Record<string, unknown>),
    queryFn: () => homeworkService.list(filters),
  });
}

export function useCreateHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHomeworkPayload) => homeworkService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Homework assigned');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create homework')),
  });
}

export function useUpdateHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateHomeworkPayload }) =>
      homeworkService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Homework updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update homework')),
  });
}

export function useDeleteHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => homeworkService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Homework deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete homework')),
  });
}

export function useDailyAssignments(filters: DailyAssignmentListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.homework.daily.list(filters as Record<string, unknown>),
    queryFn: () => dailyAssignmentsService.list(filters),
  });
}

export function useCreateDailyAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDailyAssignmentPayload) => dailyAssignmentsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Daily assignment created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create daily assignment')),
  });
}

export function useUpdateDailyAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDailyAssignmentPayload }) =>
      dailyAssignmentsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Daily assignment updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update daily assignment')),
  });
}

export function useDeleteDailyAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dailyAssignmentsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Daily assignment deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete daily assignment')),
  });
}
