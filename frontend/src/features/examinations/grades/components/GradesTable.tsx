import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { Grade } from '@app-types/examinations/grade';

interface GradesTableProps {
  grades: Grade[];
  onEdit: (grade: Grade) => void;
  onDelete: (grade: Grade) => void;
}

const columns: DataTableColumn<Grade>[] = [
  {
    id: 'name',
    header: 'Grade',
    cellClassName: 'font-medium',
    cell: (row) => row.name ?? '—',
  },
  {
    id: 'exam_type',
    header: 'Exam type',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.exam_type ?? '—',
  },
  {
    id: 'point',
    header: 'Point',
    cellClassName: 'tabular-nums',
    cell: (row) => row.point ?? '—',
  },
  {
    id: 'range',
    header: 'Marks',
    cellClassName: 'tabular-nums text-muted-foreground',
    cell: (row) =>
      row.mark_from != null && row.mark_upto != null ? `${row.mark_from} – ${row.mark_upto}` : '—',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active} />,
  },
];

export function GradesTable({ grades, onEdit, onDelete }: GradesTableProps) {
  return (
    <DataTable
      data={grades}
      columns={columns}
      getRowKey={(grade) => grade.id}
      actions={(grade) => {
        const isActive = grade.is_active === 'yes';
        return (
          <>
            <PermissionButton
              permission="exams.edit"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(grade)}
              aria-label={`Edit ${grade.name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="exams.delete"
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(grade)}
              aria-label={`Delete ${grade.name}`}
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
