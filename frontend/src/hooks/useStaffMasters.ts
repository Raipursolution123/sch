import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { staffMastersService } from '@services/api/staff-masters.service';
import type {
  CreateStaffDepartmentPayload,
  CreateStaffDesignationPayload,
  UpdateStaffDepartmentPayload,
  UpdateStaffDesignationPayload,
} from '@app-types/staff/staff';
import { getApiErrorMessage } from '@utils/session';

export function useStaffDepartmentsList(query = '') {
  return useQuery({
    queryKey: [...queryKeys.staff.departments(), query] as const,
    queryFn: () => staffMastersService.listDepartments(query || undefined),
  });
}

export function useCreateStaffDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffDepartmentPayload) =>
      staffMastersService.createDepartment(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.departments() });
      toast.success('Department created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create department')),
  });
}

export function useUpdateStaffDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffDepartmentPayload }) =>
      staffMastersService.updateDepartment(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.departments() });
      toast.success('Department updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update department')),
  });
}

export function useDeleteStaffDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffMastersService.deleteDepartment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.departments() });
      toast.success('Department deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete department')),
  });
}

export function useStaffDesignationsList(query = '') {
  return useQuery({
    queryKey: [...queryKeys.staff.designations(), query] as const,
    queryFn: () => staffMastersService.listDesignations(query || undefined),
  });
}

export function useCreateStaffDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffDesignationPayload) =>
      staffMastersService.createDesignation(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.designations() });
      toast.success('Designation created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create designation')),
  });
}

export function useUpdateStaffDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffDesignationPayload }) =>
      staffMastersService.updateDesignation(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.designations() });
      toast.success('Designation updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update designation')),
  });
}

export function useDeleteStaffDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffMastersService.deleteDesignation(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.designations() });
      toast.success('Designation deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete designation')),
  });
}
