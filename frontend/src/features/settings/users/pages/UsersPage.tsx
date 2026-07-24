import { useState } from 'react';
import { Input } from '@components/ui/input';
import {
  UserFormDialog,
  type UserFormValues,
} from '@features/settings/users/components/UserFormDialog';
import { UsersTable } from '@features/settings/users/components/UsersTable';
import { useStaffUsers, useUpdateStaffUser } from '@hooks/useRoles';
import type { StaffUserAccount } from '@app-types/settings/roles';
import { ModuleListPack } from '@workflow-packs';

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error, refetch } = useStaffUsers(page, query);
  const users = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const updateMutation = useUpdateStaffUser();
  const [selected, setSelected] = useState<StaffUserAccount | null>(null);

  const handleSubmit = (values: UserFormValues) => {
    if (!selected) return;
    updateMutation.mutate(
      {
        id: selected.id,
        payload: {
          role_id: Number(values.role_id),
          is_active: values.is_active,
        },
      },
      { onSuccess: () => setSelected(null) },
    );
  };

  return (
    <ModuleListPack
      title="User Accounts"
      description="Manage staff login accounts: assign roles and enable or disable access."
      isLoading={isLoading}
      loadingMessage="Loading users..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && users.length === 0}
      emptyTitle="No staff users found"
      emptyDescription="Staff login accounts appear here once linked in the users table."
      actions={
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search);
          }}
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username, name, email…"
            className="w-64"
            aria-label="Search users"
          />
        </form>
      }
      footer={
        <UserFormDialog
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          user={selected}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
        />
      }
    >
      <UsersTable
        users={users}
        totalCount={totalCount}
        page={page}
        onPageChange={setPage}
        onEdit={setSelected}
      />
    </ModuleListPack>
  );
}
