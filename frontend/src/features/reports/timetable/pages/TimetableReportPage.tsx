import { useEffect, useMemo, useState } from 'react';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { ReportSummaryGrid } from '@components/reports';
import { useActiveSession, useSessions } from '@features/academics/sessions/hooks/useSessions';
import { useClasses } from '@hooks/useClasses';
import { useSections } from '@hooks/useSections';
import { useTimetable } from '@hooks/useTimetable';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';
import {
  TIMETABLE_DAYS,
  type TimetableDay,
  type TimetablePeriod,
} from '@app-types/academics/timetable';
import { cn } from '@utils/cn';

function formatTimeRange(period: TimetablePeriod): string {
  if (period.time_from && period.time_to) {
    return `${period.time_from} – ${period.time_to}`;
  }
  if (period.start_time && period.end_time) {
    return `${period.start_time.slice(0, 5)} – ${period.end_time.slice(0, 5)}`;
  }
  return '—';
}

function periodsForDay(periods: TimetablePeriod[], day: TimetableDay): TimetablePeriod[] {
  return periods
    .filter((p) => p.day === day)
    .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
}

export function TimetableReportPage() {
  const { data: activeSessionData } = useActiveSession();
  const activeSessionId = activeSessionData?.id;

  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results ?? [];

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

  const [sessionFilter, setSessionFilter] = useState<number | undefined>(undefined);
  const [classFilter, setClassFilter] = useState<number | undefined>(undefined);
  const [sectionFilter, setSectionFilter] = useState<number | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (sessionFilter === undefined && activeSessionId) {
      setSessionFilter(activeSessionId);
    }
  }, [activeSessionId, sessionFilter]);

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

  const querySessionId = submitted ? (sessionFilter ?? activeSessionId) : undefined;
  const queryClassId = submitted ? classFilter : undefined;
  const querySectionId = submitted ? sectionFilter : undefined;

  const {
    data: periods = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTimetable(querySessionId, queryClassId, querySectionId);

  const handleExportCsv = () => {
    if (periods.length === 0) return;
    exportToCsv(
      `timetable-report-${queryClassId}-${querySectionId}`,
      ['Day', 'Subject', 'Time', 'Teacher', 'Room No'],
      periods.map((row) => [
        String(row.day),
        String(row.subject_name ?? 'Subject'),
        String(formatTimeRange(row)),
        String(row.staff_name ?? 'Teacher'),
        String(row.room_no ?? ''),
      ]),
    );
  };

  const selectedClassName = classes.find((c) => c.id === classFilter)?.class_name ?? '';
  const selectedSectionName = sections.find((s) => s.id === sectionFilter)?.section_name ?? '';

  return (
    <ModuleReportPack
      title="Timetable Report"
      description="View class timetable reports by class and section."
      printTitle={`Timetable Report - Class ${selectedClassName} (${selectedSectionName})`}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={periods.length === 0}
      onApply={() => setSubmitted(true)}
      applyDisabled={
        sessionFilter === undefined ||
        classFilter === undefined ||
        sectionFilter === undefined ||
        (submitted && isLoading)
      }
      submitted={submitted}
      hasData={periods.length > 0}
      isLoading={submitted && isLoading}
      loadingMessage="Loading timetable..."
      isError={submitted && isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={submitted && !isLoading && !isError && periods.length === 0}
      emptyTitle="No timetable periods configured"
      emptyDescription="Create timetable periods in Academics -> Timetable before viewing this report."
      summary={
        periods.length > 0 ? (
          <ReportSummaryGrid
            items={[
              { label: 'Total Periods', value: periods.length },
              { label: 'Days Scheduled', value: new Set(periods.map((p) => p.day)).size },
            ]}
          />
        ) : undefined
      }
      filters={
        <>
          <FormField label="Session" htmlFor="timetable_report_session">
            <Select
              id="timetable_report_session"
              placeholder="Select Session"
              options={sessions.map((s) => ({ value: String(s.id), label: s.session }))}
              value={sessionFilter ? String(sessionFilter) : ''}
              onChange={(e) => {
                setSessionFilter(Number(e.target.value));
                setSubmitted(false);
              }}
            />
          </FormField>
          <FormField label="Class" htmlFor="timetable_report_class">
            <Select
              id="timetable_report_class"
              placeholder="Select Class"
              options={classes.map((c) => ({ value: String(c.id), label: c.class_name }))}
              value={classFilter ? String(classFilter) : ''}
              onChange={(e) => {
                setClassFilter(Number(e.target.value));
                setSubmitted(false);
              }}
            />
          </FormField>
          <FormField label="Section" htmlFor="timetable_report_section">
            <Select
              id="timetable_report_section"
              placeholder="Select Section"
              options={sections.map((s) => ({ value: String(s.id), label: s.section_name }))}
              value={sectionFilter ? String(sectionFilter) : ''}
              onChange={(e) => {
                setSectionFilter(Number(e.target.value));
                setSubmitted(false);
              }}
            />
          </FormField>
        </>
      }
    >
      {periods.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 print:grid-cols-7">
          {TIMETABLE_DAYS.map((day) => {
            const dayPeriods = periodsForDay(periods, day);
            return (
              <div key={day} className="flex min-h-[10rem] flex-col rounded-lg border bg-card">
                <div className="border-b bg-muted/20 px-3 py-2">
                  <h3 className="text-sm font-semibold">{day}</h3>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-2">
                  {dayPeriods.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">No periods</p>
                  ) : (
                    dayPeriods.map((period) => (
                      <div
                        key={period.id}
                        className={cn('rounded-md border bg-muted/10 p-2 text-xs shadow-sm')}
                      >
                        <div className="font-semibold text-ink">
                          {period.subject_name ?? 'Subject'}
                        </div>
                        <div className="mt-0.5 font-medium text-muted-foreground">
                          {formatTimeRange(period)}
                        </div>
                        <div className="mt-0.5 truncate text-muted-foreground">
                          {period.staff_name ?? 'Teacher'}
                        </div>
                        {period.room_no ? (
                          <div className="mt-0.5 text-muted-foreground">Room {period.room_no}</div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModuleReportPack>
  );
}
