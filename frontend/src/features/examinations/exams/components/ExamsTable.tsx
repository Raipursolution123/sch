import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { Exam } from '@app-types/examinations/exam';
import { formatDate } from '@utils/format';

interface ExamsTableProps {
  exams: Exam[];
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
}

const columns: DataTableColumn<Exam>[] = [
  {
    id: 'name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'exam_group',
    header: 'Group',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.exam_group_name,
  },
  {
    id: 'session',
    header: 'Session',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.session_name,
  },
  {
    id: 'dates',
    header: 'Dates',
    cellClassName: 'text-muted-foreground',
    cell: (row) => {
      if (!row.date_from && !row.date_to) return '—';
      if (row.date_from && row.date_to) {
        return `${formatDate(row.date_from)} – ${formatDate(row.date_to)}`;
      }
      return formatDate(row.date_from ?? row.date_to);
    },
  },
  {
    id: 'passing',
    header: 'Pass %',
    cellClassName: 'tabular-nums text-muted-foreground',
    cell: (row) => (row.passing_percentage != null ? `${row.passing_percentage}%` : '—'),
  },
  {
    id: 'published',
    header: 'Published',
    cell: (row) => (
      <Badge variant={row.is_published ? 'success' : 'secondary'}>
        {row.is_published ? 'Published' : 'Draft'}
      </Badge>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active} />,
  },
  {
    id: 'created',
    header: 'Created',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.created_at),
  },
];

export function ExamsTable({ exams, onEdit, onDelete }: ExamsTableProps) {
  return (
    <DataTable
      data={exams}
      columns={columns}
      getRowKey={(exam) => exam.id}
      actions={(exam) => {
        const isActive = exam.is_active === 'yes';
        return (
          <>
            <PermissionButton
              permission="exams.edit"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(exam)}
              aria-label={`Edit ${exam.name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="exams.delete"
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(exam)}
              aria-label={`Delete ${exam.name}`}
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
