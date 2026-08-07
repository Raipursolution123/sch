import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { hostelAttendanceService } from '@services/api/hostel-attendance.service';
import { getApiErrorMessage } from '@utils/session';

export function useHostelAttendanceRoster(hostelId: number, date: string, enabled: boolean) {
  return useQuery({
    queryKey: ['attendance', 'hostel', hostelId, date],
    queryFn: () => hostelAttendanceService.getRoster(hostelId, date),
    enabled: enabled && hostelId > 0 && Boolean(date),
  });
}

export function useMarkHostelAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hostelAttendanceService.mark,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['attendance', 'hostel'] });
      toast.success('Hostel attendance saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save hostel attendance')),
  });
}
