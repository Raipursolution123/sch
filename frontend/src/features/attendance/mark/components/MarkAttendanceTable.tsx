import { useMemo, useState } from 'react';
import type { AttendanceRosterEntry, AttendanceType } from '@app-types/attendance/attendance';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { AttendanceStatusChips } from '@features/attendance/components/AttendanceStatusChips';

export type MarkAttendanceRow = AttendanceRosterEntry;

interface MarkAttendanceTableProps {
  entries: MarkAttendanceRow[];
  types: AttendanceType[];
  onStatusChange: (studentId: number, attendenceTypeId: number) => void;
  onRemarkChange: (studentId: number, remark: string) => void;
  onBulkStatusChange?: (studentIds: number[], attendenceTypeId: number) => void;
  /** Enable checkbox column + bulk mark actions. @default true */
  enableBulkSelection?: boolean;
}

export function MarkAttendanceTable({
  entries,
  types,
  onStatusChange,
  onRemarkChange,
  onBulkStatusChange,
  enableBulkSelection = true,
}: MarkAttendanceTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const presentTypeId = useMemo(
    () => types.find((t) => t.is_active === 'yes' && t.key === 'present')?.id,
    [types],
  );
  const absentTypeId = useMemo(
    () => types.find((t) => t.is_active === 'yes' && t.key === 'absent')?.id,
    [types],
  );

  const selectedIds = useMemo(
    () =>
      entries
        .filter((entry) => rowSelection[String(entry.student_id)])
        .map((entry) => entry.student_id),
    [entries, rowSelection],
  );

  const columns: DataTableColumn<MarkAttendanceRow>[] = [
    {
      id: 'roll_no',
      header: 'Roll',
      cellClassName: 'tabular-nums text-muted-foreground w-16 align-middle',
      cell: (row) => (row.roll_no != null ? row.roll_no : '—'),
    },
    {
      id: 'student',
      header: 'Student',
      cellClassName: 'font-medium align-middle',
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
      cellClassName: 'align-middle min-w-[16rem]',
      cell: (row) => (
        <AttendanceStatusChips
          types={types}
          value={row.attendence_type_id}
          onChange={(typeId) => onStatusChange(row.student_id, typeId)}
          ariaLabel={`Status for ${row.full_name}`}
        />
      ),
    },
    {
      id: 'remark',
      header: 'Remark',
      cellClassName: 'align-middle min-w-[10rem]',
      cell: (row) => (
        <Input
          aria-label={`Remark for ${row.full_name}`}
          value={row.remark}
          placeholder="Optional"
          className="min-h-11"
          onChange={(e) => onRemarkChange(row.student_id, e.target.value)}
        />
      ),
    },
  ];

  const bulkActions =
    enableBulkSelection && onBulkStatusChange ? (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={selectedIds.length === 0 || !presentTypeId}
          onClick={() => presentTypeId && onBulkStatusChange(selectedIds, presentTypeId)}
        >
          Mark selected present
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={selectedIds.length === 0 || !absentTypeId}
          onClick={() => absentTypeId && onBulkStatusChange(selectedIds, absentTypeId)}
        >
          Mark selected absent
        </Button>
      </>
    ) : undefined;

  return (
    <DataTable
      data={entries}
      columns={columns}
      getRowKey={(row) => row.student_id}
      enableRowSelection={enableBulkSelection}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      bulkActions={bulkActions}
      stickyHeader
      density="comfortable"
    />
  );
}
