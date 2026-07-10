import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { Select } from '@components/ui/select';
import { TimetableGrid } from '@features/academics/timetable/components/TimetableGrid';
import { TimetablePeriodDialog } from '@features/academics/timetable/components/TimetablePeriodDialog';
import type { TimetablePeriodFormValues } from '@features/academics/timetable/schemas/timetable.schema';
import { useActiveSession, useSessions } from '@features/academics/sessions/hooks/useSessions';
import { useClasses } from '@hooks/useClasses';
import { useSections } from '@hooks/useSections';
import { useStaff } from '@hooks/useStaff';
import {
  useCreateTimetablePeriod,
  useDeleteTimetablePeriod,
  useTimetable,
  useTimetableSubjectOptions,
  useUpdateTimetablePeriod,
} from '@hooks/useTimetable';
import type { TimetableDay, TimetablePeriod } from '@app-types/academics/timetable';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

export function TimetablePage() {
  const { data: activeSessionData } = useActiveSession();
  const activeSessionId = activeSessionData?.id;

  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results ?? [];

  const [sessionFilter, setSessionFilter] = useState<number | undefined>(undefined);
  const [classFilter, setClassFilter] = useState<number | undefined>(undefined);
  const [sectionFilter, setSectionFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (sessionFilter === undefined && activeSessionId) {
      setSessionFilter(activeSessionId);
    }
  }, [activeSessionId, sessionFilter]);

  const sessionId = sessionFilter ?? activeSessionId;

  const { data: classesData } = useClasses();
  const classes = useMemo(
    () =>
      (classesData?.results ?? [])
        .filter((c) => c.is_active === 'yes')
        .sort((a, b) => a.sort_order - b.sort_order),
    [classesData],
  );

  const { data: sectionsData } = useSections();
  const sections = useMemo(
    () =>
      [...(sectionsData?.results ?? [])]
        .filter((s) => s.is_active === 'yes')
        .sort((a, b) => a.section_name.localeCompare(b.section_name)),
    [sectionsData],
  );

  useEffect(() => {
    if (classFilter === undefined && classes.length > 0) {
      setClassFilter(classes[0].id);
    }
  }, [classFilter, classes]);

  useEffect(() => {
    if (sectionFilter === undefined && sections.length > 0) {
      setSectionFilter(sections[0].id);
    }
  }, [sectionFilter, sections]);

  const gridReady =
    sessionId !== undefined && classFilter !== undefined && sectionFilter !== undefined;

  const { data: periods, isLoading, isError, error, refetch } = useTimetable(
    sessionId,
    classFilter,
    sectionFilter,
  );

  const { data: subjectOptions = [] } = useTimetableSubjectOptions(
    sessionId,
    classFilter,
    sectionFilter,
    gridReady,
  );

  const { data: staffData } = useStaff(1);
  const staff = staffData?.results ?? [];

  const createMutation = useCreateTimetablePeriod();
  const updateMutation = useUpdateTimetablePeriod();
  const deleteMutation = useDeleteTimetablePeriod();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [defaultDay, setDefaultDay] = useState<TimetableDay>('Monday');
  const [selectedPeriod, setSelectedPeriod] = useState<TimetablePeriod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimetablePeriod | null>(null);

  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: String(s.id), label: s.session })),
    [sessions],
  );
  const classOptions = useMemo(
    () => classes.map((c) => ({ value: String(c.id), label: c.class_name })),
    [classes],
  );
  const sectionOptions = useMemo(
    () => sections.map((s) => ({ value: String(s.id), label: s.section_name })),
    [sections],
  );

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedPeriod(null);
  };

  const handleSubmit = (values: TimetablePeriodFormValues) => {
    if (!gridReady) return;
    const payload = {
      subject_group_subject_id: values.subject_group_subject_id,
      staff_id: values.staff_id,
      day: values.day,
      start_time: values.start_time,
      end_time: values.end_time,
      room_no: values.room_no || null,
    };
    if (dialogMode === 'edit' && selectedPeriod) {
      updateMutation.mutate({ id: selectedPeriod.id, payload }, { onSuccess: closeDialog });
      return;
    }
    createMutation.mutate(
      {
        session_id: sessionId,
        class_id: classFilter,
        section_id: sectionFilter,
        ...payload,
      },
      { onSuccess: closeDialog },
    );
  };

  const filters = (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="tt-session" className="mb-1 block text-xs text-muted-foreground">
          Session
        </label>
        <Select
          id="tt-session"
          className="w-40"
          options={sessionOptions}
          value={sessionId ? String(sessionId) : ''}
          onChange={(e) => setSessionFilter(Number(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="tt-class" className="mb-1 block text-xs text-muted-foreground">
          Class
        </label>
        <Select
          id="tt-class"
          className="w-36"
          options={classOptions}
          value={classFilter ? String(classFilter) : ''}
          onChange={(e) => setClassFilter(Number(e.target.value))}
          disabled={classOptions.length === 0}
        />
      </div>
      <div>
        <label htmlFor="tt-section" className="mb-1 block text-xs text-muted-foreground">
          Section
        </label>
        <Select
          id="tt-section"
          className="w-28"
          options={sectionOptions}
          value={sectionFilter ? String(sectionFilter) : ''}
          onChange={(e) => setSectionFilter(Number(e.target.value))}
          disabled={sectionOptions.length === 0}
        />
      </div>
    </div>
  );

  return (
    <ModuleListPack
      title="Class Timetable"
      description="Weekly schedule per class section. Assign subjects and teachers to time slots."
      actions={filters}
      isLoading={isLoading}
      loadingMessage="Loading timetable..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      prerequisiteHint={
        !gridReady ? (
          <p className="text-sm text-muted-foreground">
            Select session, class, and section to view the timetable.
          </p>
        ) : subjectOptions.length === 0 ? (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Assign subjects to a subject group for this class-section before scheduling
            periods.
          </p>
        ) : (periods?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            Use the + button on a day column to add the first period.
          </p>
        ) : undefined
      }
      footer={
        <>
          <TimetablePeriodDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeDialog();
            }}
            period={dialogMode === 'edit' ? selectedPeriod : null}
            defaultDay={defaultDay}
            subjectOptions={subjectOptions}
            staff={staff}
            onSubmit={handleSubmit}
            isLoading={
              createMutation.isPending || updateMutation.isPending
            }
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete period?"
            description={
              deleteTarget
                ? `Remove ${deleteTarget.subject_name ?? 'this period'} on ${deleteTarget.day}?`
                : ''
            }
            confirmLabel="Delete"
            destructive
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
            isLoading={deleteMutation.isPending}
          />
        </>
      }
    >
      {gridReady ? (
        <TimetableGrid
          periods={periods ?? []}
          onAdd={(day) => {
            if (subjectOptions.length === 0) return;
            setDefaultDay(day);
            setSelectedPeriod(null);
            setDialogMode('create');
          }}
          onEdit={(period) => {
            setSelectedPeriod(period);
            setDialogMode('edit');
          }}
          onDelete={setDeleteTarget}
        />
      ) : null}
    </ModuleListPack>
  );
}
