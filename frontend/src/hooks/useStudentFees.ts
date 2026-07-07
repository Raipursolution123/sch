import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { studentFeesService } from '@services/api';

export function useStudentFees(studentId: number) {
  return useQuery({
    queryKey: queryKeys.students.fees(studentId),
    queryFn: () => studentFeesService.getForStudent(studentId),
    enabled: studentId > 0,
  });
}

export function usePayStudentFee(studentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { amount: number; feetype_id: number; payment_mode?: string; description?: string; date?: string }) =>
      studentFeesService.payFee(studentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.fees(studentId) });
    },
  });
}

export function useRevertStudentFee(studentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feetypeId: number) => studentFeesService.revertFee(studentId, feetypeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.fees(studentId) });
    },
  });
}

export function useDeletePayment(studentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: number) => studentFeesService.deletePayment(studentId, paymentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.fees(studentId) });
    },
  });
}
