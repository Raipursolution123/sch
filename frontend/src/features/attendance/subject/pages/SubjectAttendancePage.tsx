import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Button } from '@components/ui/button';
import { Combobox } from '@components/ui/combobox';
import { Input } from '@components/ui/input';
import { AttendanceStatusChips } from '@features/attendance/components/AttendanceStatusChips';
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
import type { SubjectAttendanceRosterEntry } from '@app-types/attendance/subject-attendance';
import { todayIsoDate } from '@utils/student';
import { ModuleMarkGridPack } from '@workflow-packs';

type MarkRow = SubjectAttendanceRosterEntry;

export function SubjectAttendancePage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
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
  const sectionOptions = useMemo(() => {
    const opts = sectionOptionsForClass(classSections, classId);
    if (classId > 0 && opts.length === 0) {
      return [{ value: '0', label: 'No Sections (Auto-Selected)' }];
    }
    return opts;
  }, [classSections, classId]);

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

  const presentTypeId = useMemo(
    () => types.find((t) => t.is_active === 'yes' && t.key === 'present')?.id,
    [types],
  );
  const absentTypeId = useMemo(
    () => types.find((t) => t.is_active === 'yes' && t.key === 'absent')?.id,
    [types],
  );

  useEffect(() => {
    if (activeClasses.length > 0 && classId === 0) setClassId(activeClasses[0].id);
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
    setPeriodId(0);
  }, [classId, sectionId, date]);

  useEffect(() => {
    if (periods.length > 0) {
      const exists = periods.some((p) => p.id === periodId);
      if (!exists) {
        setPeriodId(periods[0].id);
      }
    } else {
      setPeriodId(0);
    }
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
          onChange={(typeId) => handleStatusChange(row.student_id, typeId)}
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

  const saveButton = (
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
      className="min-h-11 gap-1"
      disabled={!rosterReady || rows.length === 0}
      isLoading={saveMutation.isPending}
    >
      <Save className="h-4 w-4" aria-hidden="true" />
      Save attendance
    </PermissionButton>
  );

  return (
    <ModuleMarkGridPack
      title="Subject Attendance"
      description="Mark period-wise attendance from the class timetable. Built for tablet marking."
      actions={saveButton}
      filterColumns={4}
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
            <Combobox
              id="subject_att_class"
              options={activeClasses.map((c) => ({
                value: String(c.id),
                label: c.class_name,
              }))}
              value={classId ? String(classId) : ''}
              onValueChange={(v) => setClassId(Number(v) || 0)}
              placeholder="Select class"
              searchPlaceholder="Search class…"
            />
          </FormField>
          <FormField label="Section" htmlFor="subject_att_section">
            <Combobox
              id="subject_att_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onValueChange={(v) => setSectionId(Number(v) || 0)}
              placeholder={sectionOptions.length ? 'Select section' : 'No sections for class'}
              searchPlaceholder="Search section…"
              disabled={sectionOptions.length === 0}
              emptyMessage="No sections mapped to this class"
            />
          </FormField>
          <FormField label="Period" htmlFor="subject_att_period">
            <Combobox
              id="subject_att_period"
              options={periodOptions}
              value={periodId ? String(periodId) : ''}
              onValueChange={(v) => setPeriodId(Number(v) || 0)}
              placeholder={periods.length ? 'Select period' : 'No periods for this day'}
              searchPlaceholder="Search period…"
              disabled={!filtersReady || periods.length === 0}
              emptyMessage="No timetable periods for this day"
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
      emptyDescription="No active students for this class section, or no timetable period is selected."
      gridToolbar={
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border bg-muted/30 px-3 py-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{rows.length}</span> students
          </p>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      }
      stickyActions={
        <>
          <p className="text-sm text-muted-foreground">Changes are not saved until you confirm.</p>
          {saveButton}
        </>
      }
    >
      <DataTable data={rows} columns={columns} getRowKey={(row) => row.student_id} />
    </ModuleMarkGridPack>
  );
}
