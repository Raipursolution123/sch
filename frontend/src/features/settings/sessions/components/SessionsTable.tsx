import { Pencil, Trash2, Zap } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { AcademicSession } from '@app-types/settings/session';
import { formatDate } from '@utils/format';

interface SessionsTableProps {
  sessions: AcademicSession[];
  onEdit: (session: AcademicSession) => void;
  onActivate: (session: AcademicSession) => void;
  onDelete: (session: AcademicSession) => void;
}

const columns: DataTableColumn<AcademicSession>[] = [
  {
    id: 'session',
    header: 'Session',
    cellClassName: 'font-medium',
    cell: (session) => session.session,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (session) => <StatusBadge isActive={session.is_active} />,
  },
  {
    id: 'created',
    header: 'Created',
    cellClassName: 'text-muted-foreground',
    cell: (session) => formatDate(session.created_at),
  },
];

export function SessionsTable({ sessions, onEdit, onActivate, onDelete }: SessionsTableProps) {
  return (
    <DataTable
      data={sessions}
      columns={columns}
      getRowKey={(session) => session.id}
      actions={(session) => {
        const isActive = session.is_active === 'yes';
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(session)}
              aria-label={`Edit ${session.session}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onActivate(session)}
              aria-label={`Activate ${session.session}`}
            >
              <Zap className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(session)}
              aria-label={`Delete ${session.session}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        );
      }}
    />
  );
}
