import type { AttendanceReportRow } from '@app-types/attendance/attendance';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { AttendanceStatusBadge } from '@features/attendance/components/AttendanceStatusBadge';
import { formatDate } from '@utils/format';

interface AttendanceReportTableProps {
  rows: AttendanceReportRow[];
}

const columns: DataTableColumn<AttendanceReportRow>[] = [
  {
    id: 'date',
    header: 'Date',
    cellClassName: 'text-muted-foreground',
    cell: (row) => formatDate(row.date),
  },
  {
    id: 'student',
    header: 'Student',
    cellClassName: 'font-medium',
    cell: (row) => row.student_name,
  },
  {
    id: 'class',
    header: 'Class',
    cell: (row) => `${row.class_name} · ${row.section_name}`,
  },
  {
    id: 'roll',
    header: 'Roll',
    cellClassName: 'tabular-nums text-muted-foreground',
    cell: (row) => (row.roll_no != null ? row.roll_no : '—'),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <AttendanceStatusBadge label={row.status_label} statusKey={row.status_key} />,
  },
  {
    id: 'remark',
    header: 'Remark',
    cellClassName: 'text-muted-foreground max-w-xs truncate',
    cell: (row) => row.remark || '—',
  },
];

export function AttendanceReportTable({ rows }: AttendanceReportTableProps) {
  return <DataTable data={rows} columns={columns} getRowKey={(row) => row.id} />;
}
