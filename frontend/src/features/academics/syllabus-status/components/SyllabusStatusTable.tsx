import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { SyllabusStatus } from '@/types/academics/syllabus-status';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { formatDate } from '@utils/format';

interface SyllabusStatusTableProps {
  syllabusStatuses: SyllabusStatus[];
  pagination: DataTablePaginationConfig;
  onEditStatus: (syllabus: SyllabusStatus) => void;
  onDeleteStatus: (id: number) => void;
}

const columns: DataTableColumn<SyllabusStatus>[] = [
  {
    id: 'topic_name',
    header: 'Topic',
    cellClassName: 'font-medium',
    cell: (row) => row.topic_name || '-',
  },
  {
    id: 'date',
    header: 'Date',
    cell: (row) => formatDate(row.date),
  },
  {
    id: 'time',
    header: 'Time',
    cell: (row) => `${row.time_from} - ${row.time_to}`,
  },
  {
    id: 'sub_topic',
    header: 'Sub Topic',
    cell: (row) => row.sub_topic || '-',
  },
  {
    id: 'presentation',
    header: 'Presentation',
    cell: (row) => row.presentation || '-',
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
];

export function SyllabusStatusTable({
  syllabusStatuses,
  pagination,
  onEditStatus,
  onDeleteStatus,
}: SyllabusStatusTableProps) {
  return (
    <DataTable
      data={syllabusStatuses}
      columns={columns}
      getRowKey={(syllabus) => syllabus.id}
      pagination={pagination}
      actions={(syllabus) => (
        <div className="flex items-center gap-2">
          <PermissionButton
            permission="manage_syllabus_status.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEditStatus(syllabus)}
            aria-label="Update Status"
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="manage_syllabus_status.delete"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this syllabus status?')) {
                onDeleteStatus(syllabus.id);
              }
            }}
            aria-label="Delete Status"
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </div>
      )}
    />
  );
}
