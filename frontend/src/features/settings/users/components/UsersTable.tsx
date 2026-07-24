import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Pagination } from '@components/ui';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { Pencil } from 'lucide-react';
import type { StaffUserAccount } from '@app-types/settings/roles';

interface UsersTableProps {
  users: StaffUserAccount[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (user: StaffUserAccount) => void;
}

const columns: DataTableColumn<StaffUserAccount>[] = [
  {
    id: 'username',
    header: 'Username',
    cellClassName: 'font-medium',
    cell: (row) => row.username || `User #${row.id}`,
  },
  {
    id: 'staff',
    header: 'Staff',
    cell: (row) => (
      <div>
        <div>{row.staff_name || '—'}</div>
        <div className="text-xs text-muted-foreground">
          {[row.employee_id, row.email].filter(Boolean).join(' · ') || '—'}
        </div>
      </div>
    ),
  },
  {
    id: 'role',
    header: 'Role',
    cell: (row) =>
      row.role_name ? (
        <div className="flex flex-wrap items-center gap-1">
          <span>{row.role_name}</span>
          {row.is_superadmin_role ? <Badge variant="secondary">Superadmin</Badge> : null}
        </div>
      ) : (
        <span className="text-muted-foreground">Unassigned</span>
      ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active ? 'yes' : 'no'} />,
  },
];

export function UsersTable({ users, totalCount, page, onPageChange, onEdit }: UsersTableProps) {
  return (
    <div className="space-y-4">
      <DataTable
        data={users}
        columns={columns}
        getRowKey={(user) => user.id}
        actions={(user) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            aria-label={`Edit ${user.username}`}
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
