import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Combobox } from '@components/ui/combobox';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { FormField } from '@components/forms/FormField';
import {
  MarkAttendanceTable,
  type MarkAttendanceRow,
} from '@features/attendance/mark/components/MarkAttendanceTable';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { useAttendanceRoster, useAttendanceTypes, useSaveAttendance } from '@hooks/useAttendance';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { todayIsoDate } from '@utils/student';
import { ModuleMarkGridPack, PackGridToolbar } from '@workflow-packs';

export function MarkAttendancePage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];
  const { data: types = [] } = useAttendanceTypes();

  const [date, setDate] = useState(todayIsoDate());
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [rows, setRows] = useState<MarkAttendanceRow[]>([]);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );
  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
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

  const presentTypeId = useMemo(
    () => types.find((t) => t.is_active === 'yes' && t.key === 'present')?.id,
    [types],
  );
  const absentTypeId = useMemo(
    () => types.find((t) => t.is_active === 'yes' && t.key === 'absent')?.id,
    [types],
  );

  useEffect(() => {
    if (activeClasses.length > 0 && classId === 0) {
      setClassId(activeClasses[0].id);
    }
  }, [activeClasses, classId]);

  useEffect(() => {
    if (classId <= 0) {
      setSectionId(0);
      return;
    }
    const next = firstSectionIdForClass(classSections, classId);
    setSectionId(next ?? 0);
  }, [classId, classSections]);

  useEffect(() => {
    if (roster) {
      setRows(roster.entries);
    }
  }, [roster]);

  const applyStatusToAll = (attendenceTypeId: number) => {
    const type = types.find((t) => t.id === attendenceTypeId);
    if (!type) return;
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        attendence_type_id: attendenceTypeId,
        status_key: type.key,
        status_label: type.label,
      })),
    );
  };

  const applyStatusToStudents = (studentIds: number[], attendenceTypeId: number) => {
    const type = types.find((t) => t.id === attendenceTypeId);
    if (!type || studentIds.length === 0) return;
    const idSet = new Set(studentIds);
    setRows((prev) =>
      prev.map((row) =>
        idSet.has(row.student_id)
          ? {
              ...row,
              attendence_type_id: attendenceTypeId,
              status_key: type.key,
              status_label: type.label,
            }
          : row,
      ),
    );
  };

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

  const canMark = activeClasses.length > 0 && sectionOptions.length > 0 && types.length > 0;
  const markedCount = rows.filter((r) => r.status_key === 'present').length;
  const absentCount = rows.filter((r) => r.status_key === 'absent').length;
  const lateCount = rows.filter((r) => r.status_key === 'late').length;

  const saveButton = (
    <PermissionButton
      permission="attendance.mark"
      onClick={handleSave}
      className="min-h-11 gap-1"
      disabled={!filtersReady || rows.length === 0}
      isLoading={saveMutation.isPending}
    >
      <Save className="h-4 w-4" aria-hidden="true" />
      Save attendance
    </PermissionButton>
  );

  return (
    <ModuleMarkGridPack
      title="Mark Attendance"
      description="Record daily attendance by class and section. Built for tablet marking."
      actions={saveButton}
      prerequisiteHint={
        !canMark ? (
          <p className="text-sm text-muted-foreground">
            Configure active classes, class–section mappings, and attendance types under Academics
            before marking attendance.
          </p>
        ) : undefined
      }
      filters={
        <>
          <FormField label="Date" htmlFor="attendance_date">
            <Input
              id="attendance_date"
              type="date"
              max={todayIsoDate()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormField>
          <FormField label="Class" htmlFor="attendance_class">
            <Combobox
              id="attendance_class"
              placeholder="Select class"
              searchPlaceholder="Search class…"
              options={activeClasses.map((c) => ({ value: String(c.id), label: c.class_name }))}
              value={classId ? String(classId) : ''}
              onValueChange={(v) => setClassId(Number(v) || 0)}
              disabled={!canMark && activeClasses.length === 0}
            />
          </FormField>
          <FormField label="Section" htmlFor="attendance_section">
            <Combobox
              id="attendance_section"
              placeholder={sectionOptions.length ? 'Select section' : 'No sections for class'}
              searchPlaceholder="Search section…"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onValueChange={(v) => setSectionId(Number(v) || 0)}
              disabled={sectionOptions.length === 0}
              emptyMessage="No sections mapped to this class"
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
      emptyDescription="Enroll students in the selected class and section, then return to mark attendance."
      gridToolbar={
        <PackGridToolbar
          summary={
            <>
              <span className="font-medium tabular-nums text-foreground">{rows.length}</span>{' '}
              students
              {rows.length > 0 && (
                <>
                  {' '}
                  · <span className="tabular-nums text-success">{markedCount}</span> present
                  {absentCount > 0 && (
                    <>
                      {' '}
                      · <span className="tabular-nums text-destructive">{absentCount}</span> absent
                    </>
                  )}
                  {lateCount > 0 && (
                    <>
                      {' '}
                      · <span className="tabular-nums text-warning-deep">{lateCount}</span> late
                    </>
                  )}
                </>
              )}
            </>
          }
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={!presentTypeId || rows.length === 0}
                onClick={() => presentTypeId && applyStatusToAll(presentTypeId)}
              >
                Mark all present
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={!absentTypeId || rows.length === 0}
                onClick={() => absentTypeId && applyStatusToAll(absentTypeId)}
              >
                Mark all absent
              </Button>
            </>
          }
        />
      }
      stickyActions={
        <>
          <p className="text-sm text-muted-foreground">Changes are not saved until you confirm.</p>
          {saveButton}
        </>
      }
    >
      <MarkAttendanceTable
        entries={rows}
        types={types}
        onStatusChange={handleStatusChange}
        onRemarkChange={handleRemarkChange}
        onBulkStatusChange={applyStatusToStudents}
      />
    </ModuleMarkGridPack>
  );
}
