import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { VisitorsBookEntry } from '@app-types/front-office/visitors-book';
import { formatDate } from '@utils/format';

interface VisitorsTableProps {
  visitors: VisitorsBookEntry[];
  onEdit: (visitor: VisitorsBookEntry) => void;
  onDelete: (visitor: VisitorsBookEntry) => void;
}

const columns: DataTableColumn<VisitorsBookEntry>[] = [
  {
    id: 'name',
    header: 'Visitor',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: (row) => row.contact,
  },
  {
    id: 'purpose',
    header: 'Purpose',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.purpose,
  },
  {
    id: 'meeting_with',
    header: 'Meeting With',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.meeting_with || '—',
  },
  {
    id: 'date',
    header: 'Visit Date',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.date),
  },
  {
    id: 'in_time',
    header: 'In / Out',
    cellClassName: 'text-muted-foreground',
    cell: (row) => `${row.in_time || '—'} / ${row.out_time || '—'}`,
  },
];

export function VisitorsTable({ visitors, onEdit, onDelete }: VisitorsTableProps) {
  return (
    <DataTable
      data={visitors}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => (
        <>
          <PermissionButton
            permission="staff.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="staff.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            aria-label={`Delete ${row.name}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
