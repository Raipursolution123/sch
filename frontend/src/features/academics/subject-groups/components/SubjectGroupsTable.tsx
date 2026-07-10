import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import type { SubjectGroup } from '@app-types/academics/subject-group';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { formatDate } from '@utils/format';

interface SubjectGroupsTableProps {
  groups: SubjectGroup[];
  pagination: DataTablePaginationConfig;
  onEdit: (group: SubjectGroup) => void;
  onDelete: (group: SubjectGroup) => void;
}

const columns: DataTableColumn<SubjectGroup>[] = [
  {
    id: 'name',
    header: 'Group',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'session',
    header: 'Session',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.session_name ?? '—',
  },
  {
    id: 'subjects',
    header: 'Subjects',
    cellClassName: 'tabular-nums text-muted-foreground',
    cell: (row) => row.subject_count,
  },
  {
    id: 'class_sections',
    header: 'Class sections',
    cellClassName: 'tabular-nums text-muted-foreground',
    cell: (row) => row.class_section_count,
  },
  {
    id: 'created',
    header: 'Created',
    cellClassName: 'text-muted-foreground',
    cell: (row) => (row.created_at ? formatDate(row.created_at) : '—'),
  },
];

export function SubjectGroupsTable({
  groups,
  pagination,
  onEdit,
  onDelete,
}: SubjectGroupsTableProps) {
  return (
    <DataTable
      data={groups}
      columns={columns}
      getRowKey={(group) => group.id}
      pagination={pagination}
      actions={(group) => (
        <>
          <PermissionButton
            permission="subject_groups.edit"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(group)}
            aria-label={`Edit ${group.name}`}
          >
            <Pencil className="h-4 w-4" />
          </PermissionButton>
          <PermissionButton
            permission="subject_groups.delete"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(group)}
            aria-label={`Delete ${group.name}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </>
      )}
    />
  );
}
