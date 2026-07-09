import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { FeeAssignment } from '@app-types/fees/fee-assignment';
import { formatAmount, formatDate } from '@utils/format';

interface FeeAssignmentsTableProps {
  assignments: FeeAssignment[];
  onEdit: (assignment: FeeAssignment) => void;
  onDelete: (assignment: FeeAssignment) => void;
}

const columns: DataTableColumn<FeeAssignment>[] = [
  {
    id: 'class',
    header: 'Class',
    cellClassName: 'font-medium',
    cell: (row) => row.class_name,
  },
  {
    id: 'fee_group',
    header: 'Fee Group',
    cell: (row) => row.fee_group_name,
  },
  {
    id: 'session',
    header: 'Session',
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.session_name,
  },
  {
    id: 'lines',
    header: 'Lines',
    cellClassName: 'text-muted-foreground tabular-nums',
    cell: (row) => row.lines.length,
  },
  {
    id: 'total',
    header: 'Total',
    cellClassName: 'tabular-nums',
    cell: (row) => formatAmount(row.total_amount),
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

export function FeeAssignmentsTable({ assignments, onEdit, onDelete }: FeeAssignmentsTableProps) {
  return (
    <DataTable
      data={assignments}
      columns={columns}
      getRowKey={(assignment) => assignment.id}
      actions={(assignment) => {
        const isActive = assignment.is_active === 'yes';
        return (
          <>
            <PermissionButton
              permission="fees.manage"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(assignment)}
              aria-label={`Edit assignment for ${assignment.class_name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="fees.manage"
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(assignment)}
              aria-label={`Delete assignment for ${assignment.class_name}`}
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
