import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { AttendanceStatusBadge } from '@features/attendance/components/AttendanceStatusBadge';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { useAttendanceTypes } from '@hooks/useAttendance';
import {
  useSaveSubjectAttendance,
  useSubjectAttendancePeriods,
  useSubjectAttendanceRoster,
} from '@hooks/useSubjectAttendance';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import type { AttendanceStatusKey } from '@app-types/attendance/attendance';
import type { SubjectAttendanceRosterEntry } from '@app-types/attendance/subject-attendance';
import { todayIsoDate } from '@utils/student';
import { ModuleMarkGridPack } from '@workflow-packs';

type MarkRow = SubjectAttendanceRosterEntry;

export function SubjectAttendancePage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];
  const { data: types = [] } = useAttendanceTypes();

  const [date, setDate] = useState(todayIsoDate());
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [periodId, setPeriodId] = useState(0);
  const [rows, setRows] = useState<MarkRow[]>([]);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );
  const sectionOptions = useMemo(
    () => sectionOptionsForClass(classSections, classId),
    [classSections, classId],
  );

  const filtersReady = classId > 0 && sectionId > 0 && Boolean(date);
  const { data: periods = [] } = useSubjectAttendancePeriods(
    classId,
    sectionId,
    date,
    filtersReady,
  );
  const rosterReady = filtersReady && periodId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useSubjectAttendanceRoster(periodId, date, rosterReady);
  const saveMutation = useSaveSubjectAttendance();

  useEffect(() => {
    if (activeClasses.length > 0 && classId === 0) setClassId(activeClasses[0].id);
  }, [activeClasses, classId]);

  useEffect(() => {
    if (classId <= 0) return;
    const next = firstSectionIdForClass(classSections, classId);
    if (next && sectionId !== next) setSectionId(next);
  }, [classId, classSections, sectionId]);

  useEffect(() => {
    setPeriodId(0);
  }, [classId, sectionId, date]);

  useEffect(() => {
    if (periods.length > 0 && periodId === 0) setPeriodId(periods[0].id);
  }, [periods, periodId]);

  useEffect(() => {
    if (roster) setRows(roster.entries);
  }, [roster]);

  const periodOptions = periods.map((p) => ({
    value: String(p.id),
    label: [
      p.subject_name || 'Subject',
      p.time_from || p.start_time || '',
      p.staff_name ? `(${p.staff_name})` : '',
    ]
      .filter(Boolean)
      .join(' · '),
  }));

  const typeOptions = types
    .filter((t) => t.is_active === 'yes')
    .map((t) => ({ value: String(t.id), label: t.label }));

  const handleStatusChange = (studentId: number, typeId: number) => {
    const type = types.find((t) => t.id === typeId);
    setRows((prev) =>
      prev.map((row) =>
        row.student_id === studentId
          ? {
              ...row,
              attendence_type_id: typeId,
              status_key: type?.key ?? row.status_key,
              status_label: type?.label ?? row.status_label,
            }
          : row,
      ),
    );
  };

  const columns: DataTableColumn<MarkRow>[] = [
    {
      id: 'roll',
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
          onChange={(e) => handleStatusChange(row.student_id, Number(e.target.value))}
        />
      ),
    },
    {
      id: 'preview',
      header: 'Mark',
      cell: (row) => (
        <AttendanceStatusBadge
          label={row.status_label}
          statusKey={(row.status_key as AttendanceStatusKey) || 'present'}
        />
      ),
    },
    {
      id: 'remark',
      header: 'Remark',
      cell: (row) => (
        <Input
          aria-label={`Remark for ${row.full_name}`}
          value={row.remark}
          placeholder="Optional"
          onChange={(e) =>
            setRows((prev) =>
              prev.map((r) =>
                r.student_id === row.student_id ? { ...r, remark: e.target.value } : r,
              ),
            )
          }
        />
      ),
    },
  ];

  return (
    <ModuleMarkGridPack
      title="Subject Attendance"
      description="Mark period-wise attendance for students based on the class timetable."
      actions={
        <PermissionButton
          permission="attendance.mark"
          onClick={() => {
            if (!rosterReady) return;
            saveMutation.mutate({
              subject_timetable_id: periodId,
              date,
              entries: rows.map((row) => ({
                student_id: row.student_id,
                attendence_type_id: row.attendence_type_id,
                remark: row.remark,
              })),
            });
          }}
          className="gap-1"
          disabled={!rosterReady || rows.length === 0}
          isLoading={saveMutation.isPending}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save attendance
        </PermissionButton>
      }
      prerequisiteHint={
        activeClasses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Configure classes and timetable periods under Academics before marking subject
            attendance.
          </p>
        ) : undefined
      }
      filters={
        <>
          <FormField label="Date" htmlFor="subject_att_date">
            <Input
              id="subject_att_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormField>
          <FormField label="Class" htmlFor="subject_att_class">
            <Select
              id="subject_att_class"
              options={activeClasses.map((c) => ({
                value: String(c.id),
                label: c.class_name,
              }))}
              value={classId ? String(classId) : ''}
              onChange={(e) => setClassId(Number(e.target.value))}
              placeholder="Select class"
            />
          </FormField>
          <FormField label="Section" htmlFor="subject_att_section">
            <Select
              id="subject_att_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onChange={(e) => setSectionId(Number(e.target.value))}
              placeholder="Select section"
            />
          </FormField>
          <FormField label="Period" htmlFor="subject_att_period">
            <Select
              id="subject_att_period"
              options={periodOptions}
              value={periodId ? String(periodId) : ''}
              onChange={(e) => setPeriodId(Number(e.target.value))}
              placeholder={periods.length ? 'Select period' : 'No periods for this day'}
              disabled={!filtersReady || periods.length === 0}
            />
          </FormField>
        </>
      }
      filtersReady={rosterReady}
      isLoading={isLoading}
      loadingMessage="Loading subject roster..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No students to mark"
      emptyDescription="No active students found for this class section, or no timetable period is selected."
    >
      <DataTable data={rows} columns={columns} getRowKey={(row) => row.student_id} />
    </ModuleMarkGridPack>
  );
}
