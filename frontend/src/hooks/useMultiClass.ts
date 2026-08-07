import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { multiClassService } from '@services/api/multi-class.service';
import { getApiErrorMessage } from '@utils/session';

export function useMultiClassRoster(classId?: number, sectionId?: number, enabled = true) {
  return useQuery({
    queryKey: ['students', 'multi-class', classId ?? 0, sectionId ?? 0],
    queryFn: () => multiClassService.getRoster(classId, sectionId),
    enabled,
  });
}

export function useSaveMultiClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: multiClassService.save,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['students', 'multi-class'] });
      toast.success('Multi-class enrollments saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save enrollments')),
  });
}
