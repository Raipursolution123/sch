import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { attendanceService } from '@services/api';
import type {
  AttendanceReportFilters,
  MarkAttendancePayload,
} from '@app-types/attendance/attendance';
import { getApiErrorMessage } from '@utils/session';

export function useAttendanceTypes() {
  return useQuery({
    queryKey: queryKeys.attendance.types(),
    queryFn: attendanceService.listTypes,
  });
}

export function useAttendanceRoster(
  classId: number,
  sectionId: number,
  date: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.attendance.roster(classId, sectionId, date),
    queryFn: () => attendanceService.getRoster(classId, sectionId, date),
    enabled: enabled && classId > 0 && sectionId > 0 && Boolean(date),
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkAttendancePayload) => attendanceService.saveMark(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      toast.success('Attendance saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save attendance')),
  });
}

export function useAttendanceReport(filters: AttendanceReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.attendance.report(filters),
    queryFn: () => attendanceService.getReport(filters),
    enabled: enabled && Boolean(filters.from_date) && Boolean(filters.to_date),
  });
}
