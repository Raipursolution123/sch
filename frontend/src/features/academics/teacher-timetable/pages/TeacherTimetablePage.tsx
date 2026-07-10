import { useEffect, useMemo, useState } from 'react';
import { Select } from '@components/ui/select';
import { TeacherTimetableGrid } from '@features/academics/teacher-timetable/components/TeacherTimetableGrid';
import { useActiveSession, useSessions } from '@features/academics/sessions/hooks/useSessions';
import { useStaff } from '@hooks/useStaff';
import { useTeacherTimetable } from '@hooks/useTeacherTimetable';
import { ModuleListPack } from '@workflow-packs';

export function TeacherTimetablePage() {
  const { data: activeSessionData } = useActiveSession();
  const activeSessionId = activeSessionData?.id;

  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const sessions = sessionsData?.results ?? [];

  const [sessionFilter, setSessionFilter] = useState<number | undefined>(undefined);
  const [staffFilter, setStaffFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (sessionFilter !== undefined) return;
    if (activeSessionId) {
      setSessionFilter(activeSessionId);
      return;
    }
    if (sessions.length > 0) {
      setSessionFilter(sessions[0].id);
    }
  }, [activeSessionId, sessionFilter, sessions]);

  const sessionId = sessionFilter ?? activeSessionId;

  const { data: staffData, isLoading: staffLoading } = useStaff(1);
  const staff = useMemo(
    () => (staffData?.results ?? []).filter((s) => s.is_active === 'yes'),
    [staffData],
  );

  useEffect(() => {
    if (staffFilter !== undefined) return;
    if (staff.length > 0) {
      setStaffFilter(staff[0].id);
    }
  }, [staffFilter, staff]);

  const filtersLoading = sessionsLoading || staffLoading;
  const gridReady = sessionId !== undefined && staffFilter !== undefined;

  const {
    data: periods,
    isLoading,
    isError,
    error,
    refetch,
  } = useTeacherTimetable(sessionId, staffFilter);

  const sessionOptions = sessions.map((s) => ({
    value: String(s.id),
    label: s.session,
  }));

  const staffOptions = staff.map((s) => ({
    value: String(s.id),
    label: s.full_name || `${s.name} ${s.surname}`,
  }));

  const selectedStaff = staff.find((s) => s.id === staffFilter);

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
          placeholder="Select session"
          value={sessionId ? String(sessionId) : ''}
          onChange={(e) => setSessionFilter(Number(e.target.value))}
          disabled={filtersLoading || sessionOptions.length === 0}
        />
      </div>
      <div>
        <label htmlFor="tt-staff" className="mb-1 block text-xs text-muted-foreground">
          Teacher
        </label>
        <Select
          id="tt-staff"
          className="w-56"
          options={staffOptions}
          placeholder="Select teacher"
          value={staffFilter ? String(staffFilter) : ''}
          onChange={(e) => setStaffFilter(Number(e.target.value))}
          disabled={filtersLoading || staffOptions.length === 0}
        />
      </div>
    </div>
  );

  return (
    <ModuleListPack
      title="Teacher Timetable"
      description={
        selectedStaff
          ? `Weekly schedule for ${selectedStaff.full_name || selectedStaff.name}.`
          : 'Weekly teaching schedule per staff member.'
      }
      actions={filters}
      isLoading={isLoading || filtersLoading}
      loadingMessage={
        filtersLoading ? 'Loading sessions and staff...' : 'Loading teacher timetable...'
      }
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && gridReady && (periods?.length ?? 0) === 0}
      emptyTitle="No periods scheduled"
      emptyDescription="This teacher has no timetable entries for the selected session."
      prerequisiteHint={
        filtersLoading ? (
          <p className="text-sm text-muted-foreground">Loading filter options...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create an academic session under Academics → Sessions, then return here.
            {!activeSessionId ? ' Also activate a session for the school-wide default.' : null}
          </p>
        ) : !gridReady ? (
          <p className="text-sm text-muted-foreground">
            Select session and teacher to view the timetable.
          </p>
        ) : staff.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add active staff members before viewing teacher timetables.
          </p>
        ) : undefined
      }
    >
      {periods && periods.length > 0 ? <TeacherTimetableGrid periods={periods} /> : null}
    </ModuleListPack>
  );
}
