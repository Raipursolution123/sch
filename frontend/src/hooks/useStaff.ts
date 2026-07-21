import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '@constants/query-keys';
import { ROUTES } from '@constants/index';
import { staffService } from '@services/api';
import type { CreateStaffPayload, UpdateStaffPayload } from '@app-types/staff/staff';
import { getApiErrorMessage } from '@utils/session';

export function useStaff(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.staff.list(page),
    queryFn: () => staffService.list(page),
  });
}

export function useStaffMember(id: number) {
  return useQuery({
    queryKey: queryKeys.staff.detail(id),
    queryFn: () => staffService.getById(id),
    enabled: id > 0,
  });
}

export function useStaffAttendance(date?: string) {
  return useQuery({
    queryKey: ['staff', 'attendance', date],
    queryFn: () => staffService.getAttendance(date),
  });
}

export function useMarkStaffAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, attendanceData }: { date: string; attendanceData: any[] }) =>
      staffService.markAttendance(date, attendanceData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff', 'attendance'] });
      toast.success('Staff attendance saved successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save staff attendance')),
  });
}

export function useStaffPayroll(month?: string, year?: string) {
  return useQuery({
    queryKey: ['staff', 'payroll', month, year],
    queryFn: () => staffService.getPayroll(month, year),
  });
}

export function useGeneratePayslip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { staff_id: number; month: string; year: string; basic_salary?: number; payment_mode?: string }) =>
      staffService.generatePayslip(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff', 'payroll'] });
      toast.success('Payslip generated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to generate payslip')),
  });
}

export function useStaffDepartments() {
  return useQuery({
    queryKey: queryKeys.staff.departments(),
    queryFn: staffService.listDepartments,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => staffService.createDepartment(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.departments() });
      toast.success('Department created successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create department')),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => staffService.updateDepartment(id, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.departments() });
      toast.success('Department updated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update department')),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffService.deleteDepartment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.departments() });
      toast.success('Department deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete department')),
  });
}

export function useStaffDesignations() {
  return useQuery({
    queryKey: queryKeys.staff.designations(),
    queryFn: staffService.listDesignations,
  });
}

export function useCreateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => staffService.createDesignation(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.designations() });
      toast.success('Designation created successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create designation')),
  });
}

export function useUpdateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => staffService.updateDesignation(id, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.designations() });
      toast.success('Designation updated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update designation')),
  });
}

export function useDeleteDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffService.deleteDesignation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.designations() });
      toast.success('Designation deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete designation')),
  });
}

export function useSuggestedEmployeeId(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.staff.suggestEmployeeId(),
    queryFn: staffService.suggestEmployeeId,
    enabled,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffService.create(payload),
    onSuccess: (staff) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success(`${staff.full_name} added successfully`);
      navigate(ROUTES.staff.detail(staff.id));
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to add staff member')),
  });
}

export function useUpdateStaff(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStaffPayload) => staffService.update(id, payload),
    onSuccess: (staff) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success(`${staff.full_name} updated successfully`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update staff member')),
  });
}

export function useUploadStaffDocument(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => staffService.uploadDocument(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to upload document')),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => staffService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Staff member deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete staff member')),
  });
}

export function useDeleteStaffDocument(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { document_type: string; document_id?: number }) =>
      staffService.deleteDocument(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Document deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete document')),
  });
}
