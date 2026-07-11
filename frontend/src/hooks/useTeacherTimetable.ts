import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { timetableService } from '@services/api/timetable.service';

export function useTeacherTimetable(sessionId?: number, staffId?: number) {
  return useQuery({
    queryKey: queryKeys.academics.teacherTimetable.grid(sessionId, staffId),
    queryFn: () => timetableService.listForStaff(sessionId!, staffId!),
    enabled: sessionId !== undefined && staffId !== undefined,
  });
}
