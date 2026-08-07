import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import {
  staffPayrollIncrementService,
  type CreateStaffPayrollIncrementPayload,
} from '@services/api/staff-payroll-increment.service';
import { getApiErrorMessage } from '@utils/session';

export function useStaffPayrollIncrements(status?: string) {
  return useQuery({
    queryKey: queryKeys.staff.payrollIncrements.list(status),
    queryFn: () => staffPayrollIncrementService.list(status),
  });
}

export function useCreateStaffPayrollIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayrollIncrementPayload) =>
      staffPayrollIncrementService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Payroll increment request created');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to create payroll increment')),
  });
}

export function useApproveStaffPayrollIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffPayrollIncrementService.approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Payroll increment approved');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to approve payroll increment')),
  });
}

export function useRejectStaffPayrollIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffPayrollIncrementService.reject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Payroll increment rejected');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to reject payroll increment')),
  });
}
