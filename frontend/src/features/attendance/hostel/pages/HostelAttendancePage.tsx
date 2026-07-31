import { useState, useMemo } from 'react';
import { Search, Save } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { todayIsoDate } from '@utils/student';
import { ModuleMarkGridPack } from '@workflow-packs';
import { useStudents } from '@hooks/useStudents';
import { toast } from 'sonner';

interface HostelRecord {
  id: number;
  admission_no: string;
  student_name: string;
  hostel_name: string;
  room_no: string;
  status: string;
}

export function HostelAttendancePage() {
  const [date, setDate] = useState(todayIsoDate());
  const [hostelId, setHostelId] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch real active students list
  const { data: students = [], isLoading, isError, error, refetch } = useStudents();

  // Local state to keep track of hostel statuses during marking session
  const [markedStatuses, setMarkedStatuses] = useState<Record<number, string>>({});

  const hostelName = hostelId === '1' ? 'Boys Hostel A' : 'Girls Hostel B';

  // Filter students based on hostel selection (e.g. gender filtering to simulate Boys/Girls hostels)
  const hostelStudents = useMemo(() => {
    if (!hasSearched) return [];

    return students
      .filter((s) => {
        if (hostelId === '1') {
          // Boys Hostel A
          return s.gender?.toLowerCase() === 'male';
        } else {
          // Girls Hostel B
          return s.gender?.toLowerCase() === 'female';
        }
      })
      .map((student, idx) => ({
        id: student.id,
        admission_no: student.admission_no,
        student_name: student.full_name,
        hostel_name: hostelName,
        room_no: String(100 + (idx % 20) + 1), // Simulated room assignment
        status: markedStatuses[student.id] || 'Present',
      }));
  }, [students, hostelId, hasSearched, hostelName, markedStatuses]);

  const handleStatusChange = (studentId: number, newStatus: string) => {
    setMarkedStatuses((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Hostel attendance saved successfully');
    } catch (e) {
      toast.error('Failed to save hostel attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: DataTableColumn<HostelRecord>[] = [
    { id: 'admission_no', header: 'Admission No', cell: (r) => r.admission_no },
    {
      id: 'student_name',
      header: 'Student Name',
      cellClassName: 'font-medium',
      cell: (r) => r.student_name,
    },
    { id: 'hostel_name', header: 'Hostel', cell: (r) => r.hostel_name },
    { id: 'room_no', header: 'Room No', cell: (r) => r.room_no },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <Select
          options={[
            { value: 'Present', label: 'Present' },
            { value: 'Absent', label: 'Absent' },
            { value: 'Late', label: 'Late' },
            { value: 'Half Day', label: 'Half Day' },
          ]}
          value={r.status}
          onChange={(e) => handleStatusChange(r.id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <ModuleMarkGridPack
      title="Hostel Attendance"
      description="Mark and view attendance for students residing in various hostel rooms."
      actions={
        hasSearched ? (
          <button
            onClick={handleSave}
            disabled={isSaving || hostelStudents.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Attendance
          </button>
        ) : (
          <button
            onClick={() => setHasSearched(true)}
            disabled={!hostelId}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            Search Hostel
          </button>
        )
      }
      filters={
        <>
          <FormField label="Date" htmlFor="hostel_date">
            <Input
              id="hostel_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormField>
          <FormField label="Hostel" htmlFor="hostel_select">
            <Select
              id="hostel_select"
              options={[
                { value: '1', label: 'Boys Hostel A' },
                { value: '2', label: 'Girls Hostel B' },
              ]}
              value={hostelId}
              onChange={(e) => {
                setHostelId(e.target.value);
                setHasSearched(false);
              }}
              placeholder="Select hostel"
            />
          </FormField>
        </>
      }
      filtersReady={Boolean(hostelId)}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!hasSearched || hostelStudents.length === 0}
      emptyTitle={hasSearched ? 'No records found' : 'Select parameters'}
      emptyDescription={
        hasSearched
          ? 'No student hostel records exist for the selected criteria.'
          : 'Select Hostel and Date, then click Search to mark attendance.'
      }
    >
      <DataTable data={hostelStudents} columns={columns} getRowKey={(r) => r.id} />
    </ModuleMarkGridPack>
  );
}
