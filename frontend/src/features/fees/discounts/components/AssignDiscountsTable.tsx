import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { PermissionButton } from '@components/rbac/PermissionButton';
import type { FeeDiscountAssignRosterStudent } from '@app-types/fees/fee-discount-assignment';

interface AssignDiscountsTableProps {
  students: FeeDiscountAssignRosterStudent[];
  selectedIds: number[];
  onToggle: (studentSessionId: number, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onUnassign: (student: FeeDiscountAssignRosterStudent) => void;
  isUnassignPending?: boolean;
}

export function AssignDiscountsTable({
  students,
  selectedIds,
  onToggle,
  onToggleAll,
  onUnassign,
  isUnassignPending,
}: AssignDiscountsTableProps) {
  const selectable = students.filter((row) => !row.is_assigned);
  const allSelectableChecked =
    selectable.length > 0 &&
    selectable.every((row) => selectedIds.includes(row.student_session_id));

  const columns: DataTableColumn<FeeDiscountAssignRosterStudent>[] = [
    {
      id: 'select',
      header: (
        <Checkbox
          checked={allSelectableChecked}
          onChange={(e) => onToggleAll(e.target.checked)}
          aria-label="Select all unassigned students"
          disabled={selectable.length === 0}
        />
      ),
      cell: (row) =>
        row.is_assigned ? (
          <span className="text-xs text-muted-foreground">Assigned</span>
        ) : (
          <Checkbox
            checked={selectedIds.includes(row.student_session_id)}
            onChange={(e) => onToggle(row.student_session_id, e.target.checked)}
            aria-label={`Select ${row.full_name}`}
          />
        ),
    },
    {
      id: 'admission',
      header: 'Admission No',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => row.admission_no ?? '—',
    },
    {
      id: 'name',
      header: 'Student',
      cellClassName: 'font-medium',
      cell: (row) => row.full_name,
    },
    {
      id: 'roll',
      header: 'Roll',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: (row) => row.roll_no ?? '—',
    },
    {
      id: 'actions',
      header: '',
      cellClassName: 'text-right',
      cell: (row) =>
        row.is_assigned && row.assignment_id ? (
          <PermissionButton
            permission="fees.manage"
            variant="ghost"
            size="sm"
            disabled={isUnassignPending}
            onClick={() => onUnassign(row)}
            className="text-destructive hover:text-destructive"
          >
            Remove
          </PermissionButton>
        ) : (
          <Button variant="ghost" size="sm" disabled>
            —
          </Button>
        ),
    },
  ];

  return (
    <DataTable data={students} columns={columns} getRowKey={(row) => row.student_session_id} />
  );
}
