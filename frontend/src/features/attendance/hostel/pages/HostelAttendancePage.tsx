import { useMemo, useState } from 'react';
import { Search, Save } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { todayIsoDate } from '@utils/student';
import { ModuleMarkGridPack } from '@workflow-packs';
import { useHostels } from '@hooks/useHostels';
import { useHostelAttendanceRoster, useMarkHostelAttendance } from '@hooks/useHostelAttendance';
import { useAttendanceTypes } from '@hooks/useAttendance';
import type { HostelAttendanceEntry } from '@services/api/hostel-attendance.service';

export function HostelAttendancePage() {
  const [date, setDate] = useState(todayIsoDate());
  const [hostelId, setHostelId] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [markedStatuses, setMarkedStatuses] = useState<Record<number, number>>({});

  const { data: hostels = [] } = useHostels();
  const { data: types = [] } = useAttendanceTypes();
  const parsedHostelId = hostelId ? Number(hostelId) : 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useHostelAttendanceRoster(parsedHostelId, date, hasSearched);
  const markMutation = useMarkHostelAttendance();

  const entries = useMemo(() => {
    if (!roster?.entries) return [];
    return roster.entries.map((entry) => ({
      ...entry,
      attendence_type_id: markedStatuses[entry.student_session_id] ?? entry.attendence_type_id,
    }));
  }, [roster, markedStatuses]);

  const handleStatusChange = (studentSessionId: number, typeId: number) => {
    setMarkedStatuses((prev) => ({ ...prev, [studentSessionId]: typeId }));
  };

  const handleSave = () => {
    if (!parsedHostelId) return;
    markMutation.mutate({
      hostel_id: parsedHostelId,
      date,
      entries: entries.map((e) => ({
        student_session_id: e.student_session_id,
        attendence_type_id: e.attendence_type_id,
        remark: e.remark,
      })),
    });
  };

  const columns: DataTableColumn<HostelAttendanceEntry>[] = [
    { id: 'admission_no', header: 'Admission No', cell: (r) => r.admission_no },
    {
      id: 'student_name',
      header: 'Student',
      cellClassName: 'font-medium',
      cell: (r) => r.student_name,
    },
    { id: 'room_no', header: 'Room', cell: (r) => r.room_no || '—' },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <Select
          value={String(r.attendence_type_id)}
          onChange={(e) => handleStatusChange(r.student_session_id, Number(e.target.value))}
          options={types.map((t) => ({ value: String(t.id), label: t.label }))}
        />
      ),
    },
  ];

  return (
    <ModuleMarkGridPack
      title="Hostel Attendance"
      description="Mark daily attendance for students residing in hostel rooms."
      actions={
        hasSearched ? (
          <button
            onClick={handleSave}
            disabled={markMutation.isPending || entries.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Attendance
          </button>
        ) : (
          <button
            onClick={() => {
              if (!hostelId) return;
              setHasSearched(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
            Load Roster
          </button>
        )
      }
      filters={
        <>
          <FormField label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
          <FormField label="Hostel">
            <Select
              value={hostelId}
              onChange={(e) => {
                setHostelId(e.target.value);
                setHasSearched(false);
              }}
              options={hostels.map((h) => ({
                value: String(h.id),
                label: h.hostel_name || `Hostel ${h.id}`,
              }))}
              placeholder="Select hostel"
            />
          </FormField>
        </>
      }
      filtersReady
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={hasSearched && entries.length === 0}
      emptyTitle={hasSearched ? 'No hostel students' : 'Select hostel and date'}
      emptyDescription={
        hasSearched
          ? 'No students are assigned to rooms in this hostel.'
          : 'Choose a hostel and date, then load the roster.'
      }
    >
      <DataTable data={entries} columns={columns} getRowKey={(r) => r.student_session_id} />
    </ModuleMarkGridPack>
  );
}
