import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { cbseMarksService } from '@services/api/cbse-marks.service';
import type { CbseMarksSavePayload } from '@app-types/examinations/cbse-marks';
import { getApiErrorMessage } from '@utils/session';

export function useCbseTimetable(examId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.examinations.cbseMarks.timetable(examId),
    queryFn: () => cbseMarksService.listTimetable(examId),
    enabled: enabled && examId > 0,
  });
}

export function useCbseMarksRoster(
  examId: number,
  timetableId: number,
  assessmentTypeId: number | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.examinations.cbseMarks.roster(examId, timetableId, assessmentTypeId ?? 0),
    queryFn: () => cbseMarksService.getRoster(examId, timetableId, assessmentTypeId),
    enabled: enabled && examId > 0 && timetableId > 0,
  });
}

export function useSaveCbseMarks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CbseMarksSavePayload) => cbseMarksService.saveMarks(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.examinations.cbseMarks.roster(
          variables.exam_id,
          variables.timetable_id,
          variables.assessment_type_id ?? 0,
        ),
      });
      toast.success('CBSE marks saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save CBSE marks')),
  });
}

export function useCbseMarksheet(examId: number, cbseExamStudentId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.examinations.cbseMarks.marksheet(examId, cbseExamStudentId),
    queryFn: () => cbseMarksService.getMarksheet(examId, { cbseExamStudentId }),
    enabled: enabled && examId > 0 && cbseExamStudentId > 0,
  });
}
