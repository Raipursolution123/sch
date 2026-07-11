import { Pencil, Trash2, Zap } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { AcademicSession } from '@features/academics/sessions/types/session.types';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { formatDate } from '@utils/format';

interface SessionsTableProps {
  sessions: AcademicSession[];
  pagination: DataTablePaginationConfig;
  onEdit: (session: AcademicSession) => void;
  onActivate: (session: AcademicSession) => void;
  onDelete: (session: AcademicSession) => void;
}

const columns: DataTableColumn<AcademicSession>[] = [
  {
    id: 'session',
    header: 'Session',
    enableSorting: true,
    sortValue: (row) => row.session,
    cellClassName: 'font-medium',
    cell: (session) => session.session,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (session) => (
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge isActive={session.is_active} />
        {session.is_current ? (
          <Badge variant="secondary" className="font-normal">
            Current
          </Badge>
        ) : null}
      </div>
    ),
  },
  {
    id: 'created',
    header: 'Created',
    enableSorting: true,
    sortValue: (row) => row.created_at,
    cellClassName: 'text-muted-foreground',
    cell: (session) => formatDate(session.created_at),
  },
];

export function SessionsTable({
  sessions,
  pagination,
  onEdit,
  onActivate,
  onDelete,
}: SessionsTableProps) {
  return (
    <DataTable
      data={sessions}
      columns={columns}
      getRowKey={(session) => session.id}
      enableSorting
      showDensityToggle
      pagination={pagination}
      actions={(session) => {
        const isCurrent = session.is_current;
        return (
          <>
            <PermissionButton
              permission="sessions.edit"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(session)}
              aria-label={`Edit ${session.session}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="sessions.edit"
              variant="ghost"
              size="sm"
              disabled={isCurrent}
              onClick={() => onActivate(session)}
              aria-label={`Activate ${session.session}`}
            >
              <Zap className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="sessions.delete"
              variant="ghost"
              size="sm"
              disabled={isCurrent}
              onClick={() => onDelete(session)}
              aria-label={`Delete ${session.session}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </PermissionButton>
          </>
        );
      }}
    />
  );
}
