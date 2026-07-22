import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '@/services/api';
import type { RoleCreatePayload, RoleUpdatePayload, RolePermission } from '@/types/settings/roles';
import { toast } from 'sonner';

export const useRolesList = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesService.getRoles(),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleCreatePayload) => rolesService.createRole(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create role');
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleUpdatePayload }) =>
      rolesService.updateRole(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rolesService.deleteRole(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role');
    },
  });
};

export const useRolePermissions = (roleId: number | null) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => (roleId ? rolesService.getRolePermissions(roleId) : Promise.resolve([])),
    enabled: roleId !== null,
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: Partial<RolePermission>[] }) =>
      rolesService.updateRolePermissions(roleId, permissions),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Role permissions updated successfully');
      queryClient.invalidateQueries({ queryKey: ['role-permissions', variables.roleId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update permissions');
    },
  });
};
