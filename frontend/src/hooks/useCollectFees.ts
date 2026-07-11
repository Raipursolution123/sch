import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { collectFeesService, studentFeesService } from '@services/api';
import { getApiErrorMessage } from '@utils/session';

export function useCollectFeesRoster(classId: number, sectionId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.fees.collect.roster(classId, sectionId),
    queryFn: () => collectFeesService.getRoster(classId, sectionId),
    enabled: enabled && classId > 0 && sectionId > 0,
  });
}

export function usePayStudentFeeFromCollect(studentId: number, classId: number, sectionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      amount: number;
      feetype_id: number;
      payment_mode?: string;
      description?: string;
      date?: string;
    }) => studentFeesService.payFee(studentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.fees(studentId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.fees.collect.roster(classId, sectionId),
      });
      toast.success('Payment recorded');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to record payment')),
  });
}
