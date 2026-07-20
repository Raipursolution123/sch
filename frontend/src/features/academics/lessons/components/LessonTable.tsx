import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { Lesson } from '@app-types/academics/lesson';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { formatDate } from '@utils/format';

interface LessonTableProps {
  lessons: Lesson[];
  pagination: DataTablePaginationConfig;
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: number) => void;
}

export function LessonTable({ lessons, pagination, onEdit, onDelete }: LessonTableProps) {
  const columns: DataTableColumn<Lesson>[] = [
    {
      id: 'serial_no',
      header: 'S.No',
      cell: (row) => {
        const index = lessons.indexOf(row);
        return (pagination.page - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      id: 'name',
      header: 'Lesson Name',
      cellClassName: 'font-medium',
      cell: (row) => row.name,
    },
    {
      id: 'subject_group_name',
      header: 'Subject Group',
      cell: (row) => row.subject_group_name || '-',
    },
    {
      id: 'subject_name',
      header: 'Subject',
      cell: (row) => row.subject_name || '-',
    },
    {
      id: 'class_section_name',
      header: 'Class & Section',
      cell: (row) => row.class_section_name || '-',
    },
    {
      id: 'created_at',
      header: 'Created At',
      cell: (row) => formatDate(row.created_at),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={lessons}
      getRowKey={(row) => row.id}
      pagination={pagination}
      actions={(row) => (
        <>
          <PermissionButton
            permission="manage_lesson.edit"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row)}
            title="Edit Lesson"
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="manage_lesson.delete"
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this lesson?')) {
                onDelete(row.id);
              }
            }}
            title="Delete Lesson"
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
