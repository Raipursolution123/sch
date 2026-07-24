import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { staffPayrollService } from '@services/api/staff-payroll.service';
import type {
  CreateStaffPayScalePayload,
  CreateStaffPayslipPayload,
  UpdateStaffPayScalePayload,
} from '@app-types/staff/payroll';
import { getApiErrorMessage } from '@utils/session';

export function useStaffPayScales() {
  return useQuery({
    queryKey: queryKeys.staff.payroll.scales(),
    queryFn: () => staffPayrollService.listScales(),
  });
}

export function useCreateStaffPayScale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayScalePayload) => staffPayrollService.createScale(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.payroll.scales() });
      toast.success('Pay scale created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create pay scale')),
  });
}

export function useUpdateStaffPayScale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffPayScalePayload }) =>
      staffPayrollService.updateScale(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.payroll.scales() });
      toast.success('Pay scale updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update pay scale')),
  });
}

export function useDeleteStaffPayScale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffPayrollService.deleteScale(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.payroll.scales() });
      toast.success('Pay scale deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete pay scale')),
  });
}

export function useStaffPayslips(staffId?: number) {
  return useQuery({
    queryKey: queryKeys.staff.payroll.payslips(staffId),
    queryFn: () => staffPayrollService.listPayslips(staffId),
  });
}

export function useCreateStaffPayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayslipPayload) => staffPayrollService.createPayslip(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.staff.all, 'payroll', 'payslips'] });
      toast.success('Payslip created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create payslip')),
  });
}

export function useDeleteStaffPayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffPayrollService.deletePayslip(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.staff.all, 'payroll', 'payslips'] });
      toast.success('Payslip deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete payslip')),
  });
}
