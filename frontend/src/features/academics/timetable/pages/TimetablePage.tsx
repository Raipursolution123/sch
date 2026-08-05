import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { Combobox } from '@components/ui/combobox';
import { TimetableGrid } from '@features/academics/timetable/components/TimetableGrid';
import { TimetablePeriodDialog } from '@features/academics/timetable/components/TimetablePeriodDialog';
import type { TimetablePeriodFormValues } from '@features/academics/timetable/schemas/timetable.schema';
import { useActiveSession, useSessions } from '@features/academics/sessions/hooks/useSessions';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
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

  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results ?? [];

  useEffect(() => {
    if (classFilter === undefined && classes.length > 0) {
      setClassFilter(classes[0].id);
    }
  }, [classFilter, classes]);

  useEffect(() => {
    if (classFilter === undefined) {
      setSectionFilter(undefined);
      return;
    }
    const next = firstSectionIdForClass(classSections, classFilter);
    setSectionFilter(next);
  }, [classFilter, classSections]);

  const sectionOptions = useMemo(
    () => (classFilter ? sectionOptionsForClass(classSections, classFilter) : []),
    [classFilter, classSections],
  );

  const gridReady =
    sessionId !== undefined && classFilter !== undefined && sectionFilter !== undefined;

  const {
    data: periods,
    isLoading,
    isError,
    error,
    refetch,
  } = useTimetable(sessionId, classFilter, sectionFilter);

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
      <div className="w-44">
        <label htmlFor="tt-session" className="mb-1 block text-xs text-muted-foreground">
          Session
        </label>
        <Combobox
          id="tt-session"
          options={sessionOptions}
          value={sessionId ? String(sessionId) : ''}
          onValueChange={(v) => setSessionFilter(Number(v) || undefined)}
          placeholder="Select session"
          searchPlaceholder="Search session…"
        />
      </div>
      <div className="w-40">
        <label htmlFor="tt-class" className="mb-1 block text-xs text-muted-foreground">
          Class
        </label>
        <Combobox
          id="tt-class"
          options={classOptions}
          value={classFilter ? String(classFilter) : ''}
          onValueChange={(v) => setClassFilter(Number(v) || undefined)}
          disabled={classOptions.length === 0}
          placeholder="Select class"
          searchPlaceholder="Search class…"
        />
      </div>
      <div className="w-36">
        <label htmlFor="tt-section" className="mb-1 block text-xs text-muted-foreground">
          Section
        </label>
        <Combobox
          id="tt-section"
          options={sectionOptions}
          value={sectionFilter ? String(sectionFilter) : ''}
          onValueChange={(v) => setSectionFilter(Number(v) || undefined)}
          disabled={sectionOptions.length === 0}
          placeholder={sectionOptions.length ? 'Select section' : 'No sections'}
          searchPlaceholder="Search section…"
          emptyMessage="No sections mapped to this class"
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
            Assign subjects to a subject group for this class-section before scheduling periods.
          </p>
        ) : (periods?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            Use the + button on a day column to add the first period for this class section.
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
            isLoading={createMutation.isPending || updateMutation.isPending}
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
