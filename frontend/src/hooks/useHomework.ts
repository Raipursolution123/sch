import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { homeworkService } from '@services/api';
import type {
  CreateHomeworkPayload,
  UpdateHomeworkPayload,
  CreateDailyAssignmentPayload,
  UpdateDailyAssignmentPayload,
} from '@app-types/index';
import { getApiErrorMessage } from '@utils/session';

// --- Homework Hooks ---
export function useHomeworkList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.homework.homeworkList.list(params),
    queryFn: () => homeworkService.listHomework(params),
  });
}

export function useCreateHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHomeworkPayload) => homeworkService.createHomework(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Homework created successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create homework')),
  });
}

export function useUpdateHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateHomeworkPayload }) =>
      homeworkService.updateHomework(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Homework updated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update homework')),
  });
}

export function useDeleteHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => homeworkService.deleteHomework(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Homework deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete homework')),
  });
}

// --- Daily Assignment Hooks ---
export function useDailyAssignmentsList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.homework.dailyAssignments.list(params),
    queryFn: () => homeworkService.listDailyAssignments(params),
  });
}

export function useCreateDailyAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDailyAssignmentPayload) => homeworkService.createDailyAssignment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Daily assignment created successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create daily assignment')),
  });
}

export function useUpdateDailyAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDailyAssignmentPayload }) =>
      homeworkService.updateDailyAssignment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Daily assignment updated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update daily assignment')),
  });
}

export function useDeleteDailyAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => homeworkService.deleteDailyAssignment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.homework.all });
      toast.success('Daily assignment deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete daily assignment')),
  });
}

// --- Homework Evaluation Hooks ---
export function useHomeworkEvaluationList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.homework.evaluations.list(params),
    queryFn: () => homeworkService.listEvaluations(params),
  });
}
