import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { SchoolClass } from '@app-types/academics/class';
import { formatDate } from '@utils/format';

interface ClassesTableProps {
  classes: SchoolClass[];
  onEdit: (schoolClass: SchoolClass) => void;
  onDelete: (schoolClass: SchoolClass) => void;
}

const columns: DataTableColumn<SchoolClass>[] = [
  {
    id: 'sort_order',
    header: 'Order',
    cellClassName: 'text-muted-foreground tabular-nums',
    cell: (row) => row.sort_order,
  },
  {
    id: 'class_name',
    header: 'Class',
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
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.created_at),
  },
];

export function ClassesTable({ classes, onEdit, onDelete }: ClassesTableProps) {
  return (
    <DataTable
      data={classes}
      columns={columns}
      getRowKey={(schoolClass) => schoolClass.id}
      actions={(schoolClass) => {
        const isActive = schoolClass.is_active === 'yes';
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(schoolClass)}
              aria-label={`Edit ${schoolClass.class_name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(schoolClass)}
              aria-label={`Delete ${schoolClass.class_name}`}
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
