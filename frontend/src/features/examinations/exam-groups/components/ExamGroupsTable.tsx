import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { ExamGroup } from '@app-types/examinations/exam-group';
import { formatDate } from '@utils/format';

interface ExamGroupsTableProps {
  examGroups: ExamGroup[];
  onEdit: (examGroup: ExamGroup) => void;
  onDelete: (examGroup: ExamGroup) => void;
}

const columns: DataTableColumn<ExamGroup>[] = [
  {
    id: 'name',
    header: 'Name',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'exam_type',
    header: 'Type',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.exam_type,
  },
  {
    id: 'description',
    header: 'Description',
    wrap: true,
    maxWidth: '20rem',
    cellClassName: 'text-muted-foreground truncate',
    cell: (row) => row.description ?? '—',
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

export function ExamGroupsTable({ examGroups, onEdit, onDelete }: ExamGroupsTableProps) {
  return (
    <DataTable
      data={examGroups}
      columns={columns}
      getRowKey={(examGroup) => examGroup.id}
      actions={(examGroup) => {
        const isActive = examGroup.is_active === 'yes';
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(examGroup)}
              aria-label={`Edit ${examGroup.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(examGroup)}
              aria-label={`Delete ${examGroup.name}`}
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
