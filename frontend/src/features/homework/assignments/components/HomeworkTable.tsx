import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { Homework } from '@app-types/academics/homework';
import { formatDate } from '@utils/format';

interface HomeworkTableProps {
  rows: Homework[];
  classNameById: Map<number, string>;
  sectionNameById: Map<number, string>;
  subjectNameById: Map<number, string>;
  staffNameById: Map<number, string>;
  onEdit: (row: Homework) => void;
  onDelete: (row: Homework) => void;
}

export function HomeworkTable({
  rows,
  classNameById,
  sectionNameById,
  subjectNameById,
  staffNameById,
  onEdit,
  onDelete,
}: HomeworkTableProps) {
  const columns: DataTableColumn<Homework>[] = [
    {
      id: 'homework_date',
      header: 'Assigned',
      cellClassName: 'whitespace-nowrap text-muted-foreground',
      cell: (row) => formatDate(row.homework_date),
    },
    {
      id: 'submit_date',
      header: 'Due',
      cellClassName: 'whitespace-nowrap text-muted-foreground',
      cell: (row) => formatDate(row.submit_date),
    },
    {
      id: 'class_section',
      header: 'Class',
      cell: (row) => {
        const cls = classNameById.get(row.class_id) ?? `#${row.class_id}`;
        const sec = sectionNameById.get(row.section_id) ?? `#${row.section_id}`;
        return `${cls} — ${sec}`;
      },
    },
    {
      id: 'subject',
      header: 'Subject',
      cellClassName: 'text-muted-foreground',
      cell: (row) =>
        row.subject_id != null
          ? (subjectNameById.get(row.subject_id) ?? `#${row.subject_id}`)
          : '—',
    },
    {
      id: 'staff',
      header: 'Teacher',
      cellClassName: 'text-muted-foreground',
      cell: (row) => staffNameById.get(row.staff_id) ?? `#${row.staff_id}`,
    },
    {
      id: 'description',
      header: 'Description',
      cellClassName: 'max-w-xs truncate font-medium',
      cell: (row) => row.description?.trim() || '—',
    },
    {
      id: 'marks',
      header: 'Marks',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => (row.marks != null ? row.marks : '—'),
    },
    {
      id: 'actions',
      header: '',
      cellClassName: 'w-28 text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <PermissionButton
            permission="homework.edit"
            variant="ghost"
            size="icon"
            aria-label="Edit homework"
            onClick={() => onEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="homework.delete"
            variant="ghost"
            size="icon"
            aria-label="Delete homework"
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
      emptyMessage="No homework assignments found."
    />
  );
}
