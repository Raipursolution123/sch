import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { staffAttendanceService } from '@services/api/staff-attendance.service';
import type { MarkStaffAttendancePayload } from '@app-types/staff/attendance';
import { getApiErrorMessage } from '@utils/session';

export function useStaffAttendanceTypes() {
  return useQuery({
    queryKey: queryKeys.staff.attendance.types(),
    queryFn: staffAttendanceService.listTypes,
  });
}

export function useStaffAttendanceRoster(date: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.staff.attendance.roster(date),
    queryFn: () => staffAttendanceService.getRoster(date),
    enabled: enabled && Boolean(date),
  });
}

export function useSaveStaffAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkStaffAttendancePayload) => staffAttendanceService.saveMark(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...queryKeys.staff.all, 'attendance'] });
      toast.success('Staff attendance saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save staff attendance')),
  });
}
