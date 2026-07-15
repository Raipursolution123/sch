import { Input } from '@components/ui/input';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { StatusBadge } from '@components/feedback/StatusBadge';
import type { StaffLeaveAllotmentRow } from '@app-types/staff/leave-allotment';

interface StaffLeaveAllotmentsTableProps {
  rows: StaffLeaveAllotmentRow[];
  values: Record<number, string>;
  onChange?: (leaveTypeId: number, value: string) => void;
  readOnly?: boolean;
}

export function StaffLeaveAllotmentsTable({
  rows,
  values,
  onChange,
  readOnly = false,
}: StaffLeaveAllotmentsTableProps) {
  const columns: DataTableColumn<StaffLeaveAllotmentRow>[] = [
    {
      id: 'type',
      header: 'Leave type',
      cellClassName: 'font-medium',
      cell: (row) => row.leave_type_name ?? '—',
    },
    {
      id: 'status',
      header: 'Type status',
      cell: (row) => <StatusBadge isActive={row.leave_type_active} />,
    },
    {
      id: 'alloted',
      header: 'Allotted days',
      cell: (row) =>
        readOnly ? (
          <span className="tabular-nums">{values[row.leave_type_id] ?? row.alloted_leave}</span>
        ) : (
          <Input
            type="number"
            min={0}
            step="0.5"
            className="w-28 tabular-nums"
            aria-label={`Allotted days for ${row.leave_type_name}`}
            value={values[row.leave_type_id] ?? row.alloted_leave}
            onChange={(e) => onChange?.(row.leave_type_id, e.target.value)}
          />
        ),
    },
    {
      id: 'used',
      header: 'Used',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => row.used_leave,
    },
    {
      id: 'remaining',
      header: 'Remaining',
      cellClassName: 'tabular-nums',
      cell: (row) => {
        const allotted = Number(values[row.leave_type_id] ?? row.alloted_leave);
        const remaining = Number.isFinite(allotted)
          ? Math.max(allotted - row.used_leave, 0)
          : row.remaining_leave;
        return remaining;
      },
    },
  ];

  return <DataTable data={rows} columns={columns} getRowKey={(row) => row.leave_type_id} />;
}
