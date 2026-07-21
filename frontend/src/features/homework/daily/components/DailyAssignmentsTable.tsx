import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { DailyAssignment } from '@app-types/academics/homework';
import { formatDate } from '@utils/format';

interface DailyAssignmentsTableProps {
  rows: DailyAssignment[];
  onEdit: (row: DailyAssignment) => void;
  onDelete: (row: DailyAssignment) => void;
}

export function DailyAssignmentsTable({ rows, onEdit, onDelete }: DailyAssignmentsTableProps) {
  const columns: DataTableColumn<DailyAssignment>[] = [
    {
      id: 'date',
      header: 'Date',
      cellClassName: 'whitespace-nowrap text-muted-foreground',
      cell: (row) => (row.date ? formatDate(row.date) : '—'),
    },
    {
      id: 'title',
      header: 'Title',
      cellClassName: 'font-medium',
      cell: (row) => row.title?.trim() || '—',
    },
    {
      id: 'student_session',
      header: 'Student session',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => row.student_session_id,
    },
    {
      id: 'subject_group_subject',
      header: 'Subject link',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => row.subject_group_subject_id,
    },
    {
      id: 'remark',
      header: 'Remark',
      cellClassName: 'max-w-xs truncate text-muted-foreground',
      cell: (row) => row.remark?.trim() || '—',
    },
    {
      id: 'actions',
      header: '',
      cellClassName: 'w-28 text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <PermissionButton
            permission="daily_assignment.edit"
            variant="ghost"
            size="icon"
            aria-label="Edit daily assignment"
            onClick={() => onEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="daily_assignment.delete"
            variant="ghost"
            size="icon"
            aria-label="Delete daily assignment"
            onClick={() => onDelete(row)}
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowKey={(row) => row.id}
      emptyMessage="No daily assignments found."
    />
  );
}
