import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { subjectAttendanceService } from '@services/api/subject-attendance.service';
import type { MarkSubjectAttendancePayload } from '@app-types/attendance/subject-attendance';
import { getApiErrorMessage } from '@utils/session';

export function useSubjectAttendancePeriods(
  classId: number,
  sectionId: number,
  date: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.attendance.subjectPeriods(classId, sectionId, date),
    queryFn: () => subjectAttendanceService.listPeriods(classId, sectionId, date),
    enabled: enabled && classId > 0 && sectionId > 0 && Boolean(date),
  });
}

export function useSubjectAttendanceRoster(periodId: number, date: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.attendance.subjectRoster(periodId, date),
    queryFn: () => subjectAttendanceService.getRoster(periodId, date),
    enabled: enabled && periodId > 0 && Boolean(date),
  });
}

export function useSaveSubjectAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkSubjectAttendancePayload) =>
      subjectAttendanceService.saveMark(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      toast.success('Subject attendance saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save subject attendance')),
  });
}
