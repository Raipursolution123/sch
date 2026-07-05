import { useMemo, useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { PageHeader } from '@components/layout/PageHeader';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { EmptyState } from '@components/feedback/EmptyState';
import { FormField } from '@components/forms/FormField';
import { AttendanceReportTable } from '@features/attendance/report/components/AttendanceReportTable';
import { useAttendanceReport } from '@hooks/useAttendance';
import { useClasses } from '@hooks/useClasses';
import { useSections } from '@hooks/useSections';
import { todayIsoDate } from '@utils/student';

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function AttendanceReportPage() {
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  
  const { data: sectionsData } = useSections();
  const sections = sectionsData?.results || [];

  const [fromDate, setFromDate] = useState(daysAgoIso(7));
  const [toDate, setToDate] = useState(todayIsoDate());
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [submitted, setSubmitted] = useState(true);

  const filters = useMemo(
    () => ({
      from_date: fromDate,
      to_date: toDate,
      ...(classId > 0 ? { class_id: classId } : {}),
      ...(sectionId > 0 ? { section_id: sectionId } : {}),
    }),
    [fromDate, toDate, classId, sectionId],
  );

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useAttendanceReport(filters, submitted);

  const classOptions = [
    { value: '', label: 'All classes' },
    ...classes
      .filter((c) => c.is_active === 'yes')
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ value: String(c.id), label: c.class_name })),
  ];
  const sectionOptions = [
    { value: '', label: 'All sections' },
    ...sections
      .filter((s) => s.is_active === 'yes')
      .sort((a, b) => a.section_name.localeCompare(b.section_name))
      .map((s) => ({ value: String(s.id), label: s.section_name })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Report"
        description="Review attendance records by date range, class, and section."
      />

      <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <FormField label="From" htmlFor="from_date">
          <Input
            id="from_date"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setSubmitted(false);
            }}
          />
        </FormField>
        <FormField label="To" htmlFor="to_date">
          <Input
            id="to_date"
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setSubmitted(false);
            }}
          />
        </FormField>
        <FormField label="Class" htmlFor="report_class">
          <Select
            id="report_class"
            options={classOptions}
            value={classId ? String(classId) : ''}
            onChange={(e) => {
              setClassId(e.target.value ? Number(e.target.value) : 0);
              setSubmitted(false);
            }}
          />
        </FormField>
        <FormField label="Section" htmlFor="report_section">
          <Select
            id="report_section"
            options={sectionOptions}
            value={sectionId ? String(sectionId) : ''}
            onChange={(e) => {
              setSectionId(e.target.value ? Number(e.target.value) : 0);
              setSubmitted(false);
            }}
          />
        </FormField>
        <div className="flex items-end">
          <Button className="w-full" onClick={() => setSubmitted(true)}>
            Apply filters
          </Button>
        </div>
      </div>

      {submitted && isLoading && <LoadingState message="Loading report..." />}

      {submitted && isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load report'}
          onRetry={() => void refetch()}
        />
      )}

      {submitted && !isLoading && !isError && report && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryPill label="Records" value={report.total_records} />
            <SummaryPill label="Present" value={report.present} />
            <SummaryPill label="Absent" value={report.absent} />
            <SummaryPill label="Late" value={report.late} />
            <SummaryPill label="Half day" value={report.half_day} />
            <SummaryPill label="Holiday" value={report.holiday} />
          </div>

          {report.rows.length === 0 ? (
            <EmptyState
              title="No records found"
              description="Try a different date range or mark attendance for this period."
            />
          ) : (
            <AttendanceReportTable rows={report.rows} />
          )}
        </>
      )}
    </div>
  );
}
