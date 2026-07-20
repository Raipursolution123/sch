import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { Topic } from '@app-types/academics/topic';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { formatDate } from '@utils/format';

interface TopicTableProps {
  topics: Topic[];
  pagination: DataTablePaginationConfig;
  onEdit: (topic: Topic) => void;
  onDelete: (id: number) => void;
}

export function TopicTable({ topics, pagination, onEdit, onDelete }: TopicTableProps) {
  const columns: DataTableColumn<Topic>[] = [
    {
      id: 'serial_no',
      header: 'S.No',
      cell: (row) => {
        const index = topics.indexOf(row);
        return (pagination.page - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      id: 'name',
      header: 'Topic Name',
      cellClassName: 'font-medium',
      cell: (row) => row.name,
    },
    {
      id: 'lesson_name',
      header: 'Lesson',
      cell: (row) => row.lesson_name || '-',
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
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 1 ? 'default' : 'secondary'}>
          {row.status === 1 ? 'Complete' : 'Incomplete'}
        </Badge>
      ),
    },
    {
      id: 'complete_date',
      header: 'Complete Date',
      cell: (row) => (row.complete_date ? formatDate(row.complete_date) : '-'),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={topics}
      getRowKey={(row) => row.id}
      pagination={pagination}
      actions={(row) => (
        <>
          <PermissionButton
            permission="manage_topic.edit"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row)}
            title="Edit Topic"
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="manage_topic.delete"
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this topic?')) {
                onDelete(row.id);
              }
            }}
            title="Delete Topic"
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
