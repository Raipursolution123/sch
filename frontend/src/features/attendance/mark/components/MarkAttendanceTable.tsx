import type { AttendanceRosterEntry, AttendanceType } from '@app-types/attendance/attendance';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { AttendanceStatusBadge } from '@features/attendance/components/AttendanceStatusBadge';

export type MarkAttendanceRow = AttendanceRosterEntry;

interface MarkAttendanceTableProps {
  entries: MarkAttendanceRow[];
  types: AttendanceType[];
  onStatusChange: (studentId: number, attendenceTypeId: number) => void;
  onRemarkChange: (studentId: number, remark: string) => void;
}

export function MarkAttendanceTable({
  entries,
  types,
  onStatusChange,
  onRemarkChange,
}: MarkAttendanceTableProps) {
  const typeOptions = types
    .filter((t) => t.is_active === 'yes')
    .map((t) => ({ value: String(t.id), label: t.label }));

  const columns: DataTableColumn<MarkAttendanceRow>[] = [
    {
      id: 'roll_no',
      header: 'Roll',
      cellClassName: 'tabular-nums text-muted-foreground w-16',
      cell: (row) => (row.roll_no != null ? row.roll_no : '—'),
    },
    {
      id: 'student',
      header: 'Student',
      cellClassName: 'font-medium',
      cell: (row) => (
        <div>
          <span>{row.full_name}</span>
          <p className="text-xs font-normal text-muted-foreground">{row.admission_no}</p>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Select
          aria-label={`Status for ${row.full_name}`}
          options={typeOptions}
          value={String(row.attendence_type_id)}
          onChange={(e) => onStatusChange(row.student_id, Number(e.target.value))}
        />
      ),
    },
    {
      id: 'preview',
      header: 'Mark',
      cell: (row) => <AttendanceStatusBadge label={row.status_label} statusKey={row.status_key} />,
    },
    {
      id: 'remark',
      header: 'Remark',
      cell: (row) => (
        <Input
          aria-label={`Remark for ${row.full_name}`}
          value={row.remark}
          placeholder="Optional"
          onChange={(e) => onRemarkChange(row.student_id, e.target.value)}
        />
      ),
    },
  ];

  return <DataTable data={entries} columns={columns} getRowKey={(row) => row.student_id} />;
}
