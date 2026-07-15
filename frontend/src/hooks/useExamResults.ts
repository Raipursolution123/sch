import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { examResultsService } from '@services/api';
import type { SaveExamResultsPayload } from '@app-types/examinations/exam-result';
import { getApiErrorMessage } from '@utils/session';

export function useExamResultRoster(examId: number, scheduleId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.examinations.results.roster(examId, scheduleId),
    queryFn: () => examResultsService.getRoster(examId, scheduleId),
    enabled: enabled && examId > 0 && scheduleId > 0,
  });
}

export function useSaveExamResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveExamResultsPayload) => examResultsService.save(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.examinations.results.all(),
      });
      toast.success(
        `Saved marks for ${result.saved_count} student${result.saved_count === 1 ? '' : 's'}`,
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save exam results')),
  });
}
