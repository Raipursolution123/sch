import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentTransportFeesService } from '@services/api/student-transport-fees.service';
import { getApiErrorMessage } from '@utils/session';

export function useStudentTransportFeeRoster(classId?: number, sectionId?: number, enabled = true) {
  return useQuery({
    queryKey: ['transport', 'student-fees', 'roster', classId ?? 0, sectionId ?? 0],
    queryFn: () => studentTransportFeesService.getRoster(classId, sectionId),
    enabled,
  });
}

export function useAssignStudentTransportFees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentTransportFeesService.assign,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transport', 'student-fees'] });
      toast.success('Transport fees assigned');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to assign transport fees')),
  });
}
