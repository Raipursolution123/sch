import { Pencil, Trash2 } from 'lucide-react';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { LeaveType } from '@app-types/staff/leave-type';

interface LeaveTypesTableProps {
  leaveTypes: LeaveType[];
  onEdit: (leaveType: LeaveType) => void;
  onDelete: (leaveType: LeaveType) => void;
}

const columns: DataTableColumn<LeaveType>[] = [
  {
    id: 'name',
    header: 'Leave type',
    cellClassName: 'font-medium',
    cell: (row) => row.name,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge isActive={row.is_active} />,
  },
];

export function LeaveTypesTable({ leaveTypes, onEdit, onDelete }: LeaveTypesTableProps) {
  return (
    <DataTable
      data={leaveTypes}
      columns={columns}
      getRowKey={(row) => row.id}
      actions={(row) => {
        const isActive = row.is_active === 'yes';
        return (
          <>
            <PermissionButton
              permission="staff.edit"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="h-4 w-4" />
            </PermissionButton>
            <PermissionButton
              permission="staff.delete"
              variant="ghost"
              size="sm"
              disabled={isActive}
              onClick={() => onDelete(row)}
              aria-label={`Delete ${row.name}`}
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
