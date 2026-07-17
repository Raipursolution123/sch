import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { studentsService } from '@services/api';
import type { UpdateStudentTransportPayload } from '@app-types/transport';
import { getApiErrorMessage } from '@utils/session';

export function useStudentTransport(studentId: number) {
  return useQuery({
    queryKey: queryKeys.students.transport(studentId),
    queryFn: () => studentsService.getTransport(studentId),
    enabled: studentId > 0,
  });
}

export function useUpdateStudentTransport(studentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStudentTransportPayload) =>
      studentsService.updateTransport(studentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.transport(studentId) });
      toast.success('Student transport assignment updated');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to update student transport')),
  });
}
