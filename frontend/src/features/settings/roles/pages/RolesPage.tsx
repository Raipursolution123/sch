import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { RolesTable } from '../components/RolesTable';
import { RoleFormDialog } from '../components/RoleFormDialog';
import { RolePermissionsDialog } from '../components/RolePermissionsDialog';
import {
  useRolesList,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/hooks/useRoles';
import type { Role } from '@/types/settings/roles';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | 'permissions' | null;

export function RolesPage() {
  const { data: roles, isLoading, isError, error, refetch } = useRolesList();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedRole(null);
  };

  const handleFormSubmit = (values: { name: string; is_system: number }) => {
    if (dialogMode === 'edit' && selectedRole) {
      updateMutation.mutate(
        { id: selectedRole.id, data: values },
        { onSuccess: closeFormDialog }
      );
      return;
    }
    createMutation.mutate(
      {
        name: values.name,
        slug: values.name.toLowerCase().replace(/\s+/g, '-'),
        is_system: values.is_system,
      },
      { onSuccess: closeFormDialog }
    );
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addRoleAction = (
    <PermissionButton
      permission="settings.manage"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Role
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Roles & Permissions"
      description="Manage system access levels by defining user roles and configuring module-level action privileges."
      actions={addRoleAction}
      isLoading={isLoading}
      loadingMessage="Loading roles..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && roles?.length === 0}
      emptyTitle="No roles configured"
      emptyDescription="Create your first user role to assign access controls."
      emptyAction={addRoleAction}
      footer={
        <>
          <RoleFormDialog
            open={dialogMode === 'create' || dialogMode === 'edit'}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            role={dialogMode === 'edit' ? selectedRole : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />

          <RolePermissionsDialog
            open={dialogMode === 'permissions'}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            role={selectedRole}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete user role?"
            description={
              deleteTarget
                ? `Permanently delete the user role "${deleteTarget.name}"? This cannot be undone.`
                : ''
            }
            confirmLabel="Delete"
            destructive
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
            isLoading={deleteMutation.isPending}
          />
        </>
      }
    >
      <RolesTable
        roles={roles ?? []}
        onEdit={(role) => {
          setSelectedRole(role);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
        onManagePermissions={(role) => {
          setSelectedRole(role);
          setDialogMode('permissions');
        }}
      />
    </ModuleListPack>
  );
}
export default RolesPage;
