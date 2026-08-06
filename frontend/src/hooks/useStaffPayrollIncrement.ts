import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { staffPayrollIncrementService } from '@services/api/staff-payroll-increment.service';
import type { CreatePayrollIncrementPayload } from '@app-types/staff/payroll-increment';
import { getApiErrorMessage } from '@utils/session';

export function useStaffPayrollIncrements() {
  return useQuery({
    queryKey: queryKeys.staff.payroll.increments(),
    queryFn: () => staffPayrollIncrementService.list(),
  });
}

export function useCreateStaffPayrollIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePayrollIncrementPayload) =>
      staffPayrollIncrementService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.payroll.increments() });
      toast.success('Payroll increment request created successfully.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create payroll increment request.'));
    },
  });
}

export function useApproveStaffPayrollIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffPayrollIncrementService.approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.payroll.increments() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Payroll increment request approved.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to approve payroll increment.'));
    },
  });
}

export function useRejectStaffPayrollIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffPayrollIncrementService.reject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.payroll.increments() });
      toast.success('Payroll increment request rejected.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to reject payroll increment.'));
    },
  });
}

export function useDeleteStaffPayrollIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffPayrollIncrementService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.payroll.increments() });
      toast.success('Payroll increment request deleted.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete payroll increment request.'));
    },
  });
}
