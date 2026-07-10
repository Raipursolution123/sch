import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Input } from '@components/ui/input';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import {
  MarkAttendanceTable,
  type MarkAttendanceRow,
} from '@features/attendance/mark/components/MarkAttendanceTable';
import { useAttendanceRoster, useAttendanceTypes, useSaveAttendance } from '@hooks/useAttendance';
import { useClasses } from '@hooks/useClasses';
import { useSections } from '@hooks/useSections';
import { todayIsoDate } from '@utils/student';
import { ModuleMarkGridPack } from '@workflow-packs';

export function MarkAttendancePage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: sectionsData } = useSections();
  const sections = sectionsData?.results || [];
  const { data: types = [] } = useAttendanceTypes();

  const [date, setDate] = useState(todayIsoDate());
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [rows, setRows] = useState<MarkAttendanceRow[]>([]);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );
  const activeSections = useMemo(
    () =>
      [...sections]
        .filter((s) => s.is_active === 'yes')
        .sort((a, b) => a.section_name.localeCompare(b.section_name)),
    [sections],
  );

  const filtersReady = classId > 0 && sectionId > 0 && Boolean(date);
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useAttendanceRoster(classId, sectionId, date, filtersReady);

  const saveMutation = useSaveAttendance();

  useEffect(() => {
    if (activeClasses.length > 0 && classId === 0) {
      setClassId(activeClasses[0].id);
    }
  }, [activeClasses, classId]);

  useEffect(() => {
    if (activeSections.length > 0 && sectionId === 0) {
      setSectionId(activeSections[0].id);
    }
  }, [activeSections, sectionId]);

  useEffect(() => {
    if (roster) {
      setRows(roster.entries);
    }
  }, [roster]);

  const handleStatusChange = (studentId: number, attendenceTypeId: number) => {
    const type = types.find((t) => t.id === attendenceTypeId);
    setRows((prev) =>
      prev.map((row) =>
        row.student_id === studentId
          ? {
              ...row,
              attendence_type_id: attendenceTypeId,
              status_key: type?.key ?? row.status_key,
              status_label: type?.label ?? row.status_label,
            }
          : row,
      ),
    );
  };

  const handleRemarkChange = (studentId: number, remark: string) => {
    setRows((prev) => prev.map((row) => (row.student_id === studentId ? { ...row, remark } : row)));
  };

  const handleSave = () => {
    if (!filtersReady) return;
    saveMutation.mutate({
      class_id: classId,
      section_id: sectionId,
      date,
      entries: rows.map((row) => ({
        student_id: row.student_id,
        attendence_type_id: row.attendence_type_id,
        remark: row.remark,
      })),
    });
  };

  const canMark = activeClasses.length > 0 && activeSections.length > 0 && types.length > 0;

  return (
    <ModuleMarkGridPack
      title="Mark Attendance"
      description="Record daily attendance by class and section."
      actions={
        <PermissionButton
          permission="attendance.mark"
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
        !canMark ? (
          <p className="text-sm text-muted-foreground">
            Configure active classes and sections under Academics before marking attendance.
          </p>
        ) : undefined
      }
      filters={
        <>
          <FormField label="Date" htmlFor="attendance_date">
            <Input
              id="attendance_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormField>
          <FormField label="Class" htmlFor="attendance_class">
            <Select
              id="attendance_class"
              placeholder="Select class"
              options={activeClasses.map((c) => ({ value: String(c.id), label: c.class_name }))}
              value={classId ? String(classId) : ''}
              onChange={(e) => setClassId(Number(e.target.value))}
              disabled={!canMark}
            />
          </FormField>
          <FormField label="Section" htmlFor="attendance_section">
            <Select
              id="attendance_section"
              placeholder="Select section"
              options={activeSections.map((s) => ({ value: String(s.id), label: s.section_name }))}
              value={sectionId ? String(sectionId) : ''}
              onChange={(e) => setSectionId(Number(e.target.value))}
              disabled={!canMark}
            />
          </FormField>
        </>
      }
      filtersReady={filtersReady}
      isLoading={isLoading}
      loadingMessage="Loading roster..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No students in this class section"
      emptyDescription="Enroll students in the selected class and section to mark attendance."
    >
      <MarkAttendanceTable
        entries={rows}
        types={types}
        onStatusChange={handleStatusChange}
        onRemarkChange={handleRemarkChange}
      />
    </ModuleMarkGridPack>
  );
}
