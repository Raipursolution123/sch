import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '@constants/query-keys';
import { ROUTES } from '@constants/index';
import { staffService } from '@services/api';
import type { CreateStaffPayload, UpdateStaffPayload } from '@app-types/staff/staff';
import { getApiErrorMessage } from '@utils/session';

export function useStaff() {
  return useQuery({
    queryKey: queryKeys.staff.list(),
    queryFn: staffService.list,
  });
}

export function useStaffMember(id: number) {
  return useQuery({
    queryKey: queryKeys.staff.detail(id),
    queryFn: () => staffService.getById(id),
    enabled: id > 0,
  });
}

export function useStaffDepartments() {
  return useQuery({
    queryKey: queryKeys.staff.departments(),
    queryFn: staffService.listDepartments,
  });
}

export function useStaffDesignations() {
  return useQuery({
    queryKey: queryKeys.staff.designations(),
    queryFn: staffService.listDesignations,
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
