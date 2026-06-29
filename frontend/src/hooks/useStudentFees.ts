import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { studentFeesService } from '@services/api';

export function useStudentFees(studentId: number) {
  return useQuery({
    queryKey: queryKeys.students.fees(studentId),
    queryFn: () => studentFeesService.getForStudent(studentId),
    enabled: studentId > 0,
  });
}
