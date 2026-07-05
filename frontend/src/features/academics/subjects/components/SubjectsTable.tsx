import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { Subject } from '@app-types/academics/subject';
import { SUBJECT_TYPE_OPTIONS } from '@features/academics/subjects/constants/options';
import { formatDate } from '@utils/format';

interface SubjectsTableProps {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

function typeLabel(type: string): string {
  return SUBJECT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

const columns: DataTableColumn<Subject>[] = [
  {
    id: 'name',
    header: 'Subject',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'code',
    header: 'Code',
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.code}</code>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    cell: (row) => (
      <Badge variant={row.type === 'practical' ? 'secondary' : 'outline'}>
        {typeLabel(row.type)}
      </Badge>
    ),
  },
  {
    id: 'linked_classes',
    header: 'Linked classes',
    cell: (row) =>
      row.linked_class_labels.length > 0 ? (
        <span className="text-sm text-muted-foreground">{row.linked_class_labels.join(', ')}</span>
      ) : (
        <span className="text-sm text-muted-foreground">All classes</span>
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

export function SubjectsTable({ subjects, onEdit, onDelete }: SubjectsTableProps) {
  return (
    <DataTable
      data={subjects}
      columns={columns}
      getRowKey={(subject) => subject.id}
      actions={(subject) => {
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(subject)}
              aria-label={`Edit ${subject.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subject)}
              aria-label={`Delete ${subject.name}`}
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
