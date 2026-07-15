import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { examEnrollmentsService } from '@services/api';
import type { EnrollExamStudentsPayload } from '@app-types/examinations/exam-enrollment';
import { getApiErrorMessage } from '@utils/session';

export function useExamEnrollmentRoster(
  examId: number,
  classId: number,
  sectionId: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.examinations.enrollments.roster(examId, classId, sectionId),
    queryFn: () => examEnrollmentsService.getRoster(examId, classId, sectionId),
    enabled: enabled && examId > 0 && classId > 0 && sectionId > 0,
  });
}

export function useEnrollExamStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EnrollExamStudentsPayload) => examEnrollmentsService.enroll(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.examinations.enrollments.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.examinations.results.all(),
      });
      toast.success(
        result.enrolled_count > 0
          ? `Enrolled ${result.enrolled_count} student${result.enrolled_count === 1 ? '' : 's'}`
          : 'No new enrollments (already enrolled)',
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to enroll students')),
  });
}

export function useUnenrollExamStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: number) => examEnrollmentsService.unenroll(enrollmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.examinations.enrollments.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.examinations.results.all(),
      });
      toast.success('Student removed from exam');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to remove student from exam')),
  });
}
