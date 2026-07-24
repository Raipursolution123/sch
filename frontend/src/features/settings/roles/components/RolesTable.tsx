import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Pagination } from '@components/ui';
import { Pencil } from 'lucide-react';
import type { RoleSummary } from '@app-types/settings/roles';

interface RolesTableProps {
  roles: RoleSummary[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onEditPermissions: (role: RoleSummary) => void;
}

const columns: DataTableColumn<RoleSummary>[] = [
  {
    id: 'name',
    header: 'Role',
    cellClassName: 'font-medium',
    cell: (row) => row.name || row.slug || `Role #${row.id}`,
  },
  {
    id: 'slug',
    header: 'Slug',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.slug || '—'}</code>
    ),
  },
  {
    id: 'flags',
    header: 'Flags',
    cell: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.is_active ? (
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        )}
        {row.is_system ? <Badge variant="outline">System</Badge> : null}
        {row.is_superadmin ? <Badge>Superadmin</Badge> : null}
      </div>
    ),
  },
];

export function RolesTable({
  roles,
  totalCount,
  page,
  onPageChange,
  onEditPermissions,
}: RolesTableProps) {
  return (
    <div className="space-y-4">
      <DataTable
        data={roles}
        columns={columns}
        getRowKey={(role) => role.id}
        actions={(role) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditPermissions(role)}
            disabled={role.is_superadmin}
            title={
              role.is_superadmin
                ? 'Superadmin role permissions cannot be edited'
                : `Edit permissions for ${role.name}`
            }
            aria-label={`Edit permissions for ${role.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      />
      <Pagination
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(totalCount / 20))}
        onPageChange={onPageChange}
      />
    </div>
  );
}
