import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { rolesService, usersService } from '@services/api';
import type {
  UpdateRolePermissionsPayload,
  UpdateStaffUserPayload,
} from '@app-types/settings/roles';
import { getApiErrorMessage } from '@utils/session';

export function useRoles(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.settings.roles.list(page),
    queryFn: () => rolesService.list(page),
  });
}

export function useRoleDetail(id: number | null) {
  return useQuery({
    queryKey: queryKeys.settings.roles.detail(id ?? 0),
    queryFn: () => rolesService.get(id as number),
    enabled: id != null && id > 0,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRolePermissionsPayload }) =>
      rolesService.updatePermissions(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.roles.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.settings.roles.detail(variables.id),
      });
      toast.success('Role permissions updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update role permissions')),
  });
}

export function useStaffUsers(page: number = 1, q: string = '') {
  return useQuery({
    queryKey: queryKeys.settings.users.list(page, q),
    queryFn: () => usersService.list(page, q),
  });
}

export function useUpdateStaffUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.users.all });
      toast.success('User updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update user')),
  });
}

export function useUserRoleOptions(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.settings.users.roleOptions(),
    queryFn: () => usersService.roleOptions(),
    enabled,
  });
}
