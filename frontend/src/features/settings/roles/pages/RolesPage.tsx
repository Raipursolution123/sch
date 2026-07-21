import { useState } from 'react';
import { RolePermissionsDialog } from '@features/settings/roles/components/RolePermissionsDialog';
import { RolesTable } from '@features/settings/roles/components/RolesTable';
import { useRoles } from '@hooks/useRoles';
import type { RoleSummary } from '@app-types/settings/roles';
import { ModuleListPack } from '@workflow-packs';

export function RolesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useRoles(page);
  const roles = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const [selected, setSelected] = useState<RoleSummary | null>(null);

  return (
    <ModuleListPack
      title="Roles & Permissions"
      description="Review staff roles and edit the legacy permission matrix (view / add / edit / delete)."
      isLoading={isLoading}
      loadingMessage="Loading roles..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && roles.length === 0}
      emptyTitle="No roles found"
      emptyDescription="Roles are managed in the legacy database. Seed data should include Admin and Teacher roles."
      footer={
        <RolePermissionsDialog
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          role={selected}
        />
      }
    >
      <RolesTable
        roles={roles}
        totalCount={totalCount}
        page={page}
        onPageChange={setPage}
        onEditPermissions={setSelected}
      />
    </ModuleListPack>
  );
}
