import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { SchoolClass } from '@app-types/academics/class';
import type { DataTablePaginationConfig } from '@components/data/data-table-types';
import { formatDate } from '@utils/format';

interface ClassesTableProps {
  classes: SchoolClass[];
  pagination: DataTablePaginationConfig;
  onEdit: (schoolClass: SchoolClass) => void;
  onDelete: (schoolClass: SchoolClass) => void;
}

const columns: DataTableColumn<SchoolClass>[] = [
  {
    id: 'sort_order',
    header: 'Order',
    enableSorting: true,
    sortValue: (row) => row.sort_order,
    cellClassName: 'text-muted-foreground tabular-nums',
    cell: (row) => row.sort_order,
  },
  {
    id: 'class_name',
    header: 'Class',
    enableSorting: true,
    sortValue: (row) => row.class_name,
    cellClassName: 'font-medium',
    cell: (row) => row.class_name,
  },
  {
    id: 'hedu',
    header: 'Program',
    cell: (row) =>
      row.is_hedu_program ? (
        <Badge variant="secondary">Higher Ed</Badge>
      ) : (
        <span className="text-muted-foreground">Standard</span>
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
    enableSorting: true,
    sortValue: (row) => row.created_at,
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.created_at),
  },
];

export function ClassesTable({ classes, pagination, onEdit, onDelete }: ClassesTableProps) {
  return (
    <DataTable
      data={classes}
      columns={columns}
      getRowKey={(schoolClass) => schoolClass.id}
      enableSorting
      showDensityToggle
      pagination={pagination}
      actions={(schoolClass) => {
        const isActive = schoolClass.is_active === 'yes';
        return (
          <>
            <PermissionButton
              permission="academics.manage"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(schoolClass)}
              aria-label={`Edit ${schoolClass.class_name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="academics.manage"
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(schoolClass)}
              aria-label={`Delete ${schoolClass.class_name}`}
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
