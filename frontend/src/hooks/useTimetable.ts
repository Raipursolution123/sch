import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { timetableService } from '@services/api/timetable.service';
import type {
  CreateTimetablePeriodPayload,
  UpdateTimetablePeriodPayload,
} from '@app-types/academics/timetable';
import { getApiErrorMessage } from '@utils/session';

export function useTimetable(
  sessionId?: number,
  classId?: number,
  sectionId?: number,
) {
  return useQuery({
    queryKey: queryKeys.academics.timetable.grid(sessionId, classId, sectionId),
    queryFn: () => timetableService.list(sessionId!, classId!, sectionId!),
    enabled:
      sessionId !== undefined && classId !== undefined && sectionId !== undefined,
  });
}

export function useTimetableSubjectOptions(
  sessionId?: number,
  classId?: number,
  sectionId?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.academics.timetable.subjectOptions(
      sessionId,
      classId,
      sectionId,
    ),
    queryFn: () =>
      timetableService.subjectOptions(sessionId!, classId!, sectionId!),
    enabled:
      enabled &&
      sessionId !== undefined &&
      classId !== undefined &&
      sectionId !== undefined,
  });
}

export function useCreateTimetablePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTimetablePeriodPayload) =>
      timetableService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.timetable.all });
      toast.success('Period added');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to add period')),
  });
}

export function useUpdateTimetablePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTimetablePeriodPayload }) =>
      timetableService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.timetable.all });
      toast.success('Period updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update period')),
  });
}

export function useDeleteTimetablePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => timetableService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.timetable.all });
      toast.success('Period deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete period')),
  });
}
