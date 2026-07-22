import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import {
  useSaveStaffAttendance,
  useStaffAttendanceRoster,
  useStaffAttendanceTypes,
} from '@hooks/useStaffAttendance';
import type { StaffAttendanceRosterEntry, StaffAttendanceType } from '@app-types/staff/attendance';
import { todayIsoDate } from '@utils/student';
import { ModuleMarkGridPack } from '@workflow-packs';

type MarkRow = StaffAttendanceRosterEntry;

function statusVariant(key: string): 'success' | 'destructive' | 'secondary' | 'outline' | 'muted' {
  const normalized = key.toLowerCase();
  if (normalized.includes('present') || normalized === 'p') return 'success';
  if (normalized.includes('absent') || normalized === 'a') return 'destructive';
  if (normalized.includes('late') || normalized === 'l') return 'outline';
  if (normalized.includes('half')) return 'secondary';
  return 'muted';
}

function StaffMarkAttendanceTable({
  entries,
  types,
  onStatusChange,
  onRemarkChange,
}: {
  entries: MarkRow[];
  types: StaffAttendanceType[];
  onStatusChange: (staffId: number, typeId: number) => void;
  onRemarkChange: (staffId: number, remark: string) => void;
}) {
  const typeOptions = types.map((t) => ({ value: String(t.id), label: t.label || t.type }));

  const columns: DataTableColumn<MarkRow>[] = [
    {
      id: 'employee_id',
      header: 'Emp. ID',
      cellClassName: 'tabular-nums text-muted-foreground w-28',
      cell: (row) => row.employee_id || '—',
    },
    {
      id: 'name',
      header: 'Staff',
      cellClassName: 'font-medium',
      cell: (row) => row.name,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Select
          aria-label={`Status for ${row.name}`}
          options={typeOptions}
          value={String(row.staff_attendance_type_id)}
          onChange={(e) => onStatusChange(row.staff_id, Number(e.target.value))}
        />
      ),
    },
    {
      id: 'preview',
      header: 'Mark',
      cell: (row) => <Badge variant={statusVariant(row.status_key)}>{row.status_label}</Badge>,
    },
    {
      id: 'remark',
      header: 'Remark',
      cell: (row) => (
        <Input
          aria-label={`Remark for ${row.name}`}
          value={row.remark}
          placeholder="Optional"
          onChange={(e) => onRemarkChange(row.staff_id, e.target.value)}
        />
      ),
    },
  ];

  return <DataTable data={entries} columns={columns} getRowKey={(row) => row.staff_id} />;
}

export function StaffAttendancePage() {
  const { data: types = [] } = useStaffAttendanceTypes();
  const [date, setDate] = useState(todayIsoDate());
  const [rows, setRows] = useState<MarkRow[]>([]);
  const filtersReady = Boolean(date);
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useStaffAttendanceRoster(date, filtersReady);
  const saveMutation = useSaveStaffAttendance();

  useEffect(() => {
    if (roster) setRows(roster.entries);
  }, [roster]);

  const handleStatusChange = (staffId: number, typeId: number) => {
    const type = types.find((t) => t.id === typeId);
    setRows((prev) =>
      prev.map((row) =>
        row.staff_id === staffId
          ? {
              ...row,
              staff_attendance_type_id: typeId,
              status_key: type?.key ?? row.status_key,
              status_label: type?.label ?? row.status_label,
            }
          : row,
      ),
    );
  };

  const handleRemarkChange = (staffId: number, remark: string) => {
    setRows((prev) => prev.map((row) => (row.staff_id === staffId ? { ...row, remark } : row)));
  };

  const handleSave = () => {
    if (!filtersReady) return;
    saveMutation.mutate({
      date,
      entries: rows.map((row) => ({
        staff_id: row.staff_id,
        staff_attendance_type_id: row.staff_attendance_type_id,
        remark: row.remark,
      })),
    });
  };

  return (
    <ModuleMarkGridPack
      title="Staff Attendance"
      description="Record daily attendance for active staff members."
      actions={
        <PermissionButton
          permission="staff.attendance.mark"
          onClick={handleSave}
          className="gap-1"
          disabled={!filtersReady || rows.length === 0}
          isLoading={saveMutation.isPending}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save attendance
        </PermissionButton>
      }
      prerequisiteHint={
        types.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No staff attendance types are configured in the database.
          </p>
        ) : undefined
      }
      filters={
        <FormField label="Date" htmlFor="staff_attendance_date">
          <Input
            id="staff_attendance_date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>
      }
      isLoading={isLoading}
      loadingMessage="Loading staff roster..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No staff to mark"
      emptyDescription="Add active staff members before recording attendance."
    >
      <StaffMarkAttendanceTable
        entries={rows}
        types={types}
        onStatusChange={handleStatusChange}
        onRemarkChange={handleRemarkChange}
      />
    </ModuleMarkGridPack>
  );
}
