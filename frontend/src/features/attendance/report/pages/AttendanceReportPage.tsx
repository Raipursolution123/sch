import { useMemo, useState } from 'react';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { AttendanceReportTable } from '@features/attendance/report/components/AttendanceReportTable';
import { useAttendanceReport } from '@hooks/useAttendance';
import { useClasses } from '@hooks/useClasses';
import { useActiveSession } from '@hooks/useSessions';
import { useSections } from '@hooks/useSections';
import { exportToCsv } from '@utils/export-csv';
import { formatDate } from '@utils/format';
import { printReport } from '@utils/print-report';
import { todayIsoDate } from '@utils/student';
import { ModuleReportPack } from '@workflow-packs';

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function AttendanceReportPage() {
  const { data: activeSession } = useActiveSession();
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

  const printSubtitle = `${formatDate(fromDate)} – ${formatDate(toDate)}${
    activeSession ? ` · Session ${activeSession.session}` : ''
  }`;

  const handleExportCsv = () => {
    if (!report) return;
    exportToCsv(
      `attendance-report-${fromDate}-to-${toDate}`,
      ['Date', 'Student', 'Class', 'Section', 'Roll', 'Status', 'Remark'],
      report.rows.map((row) => [
        row.date,
        row.student_name,
        row.class_name,
        row.section_name,
        row.roll_no != null ? String(row.roll_no) : '',
        row.status_label,
        row.remark ?? '',
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Attendance Report"
      description="Review attendance records by date range, class, and section."
      printTitle="Attendance Report"
      printSubtitle={printSubtitle}
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={!report || report.rows.length === 0}
      sessionLabel={activeSession?.session}
      onApply={() => setSubmitted(true)}
      applyDisabled={submitted && isLoading}
      submitted={submitted}
      hasData={Boolean(report)}
      isLoading={isLoading}
      loadingMessage="Loading report..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={Boolean(report && report.rows.length === 0)}
      emptyTitle="No records found"
      emptyDescription="Try a different date range or mark attendance for this period."
      summary={
        report ? (
          <ReportSummaryGrid
            items={[
              { label: 'Records', value: report.total_records },
              { label: 'Present', value: report.present, tone: 'success' },
              { label: 'Absent', value: report.absent, tone: 'destructive' },
              { label: 'Late', value: report.late, tone: 'warning' },
              { label: 'Half day', value: report.half_day },
              { label: 'Holiday', value: report.holiday },
            ]}
          />
        ) : undefined
      }
      filters={
        <>
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
        </>
      }
    >
      {report && report.rows.length > 0 && <AttendanceReportTable rows={report.rows} />}
    </ModuleReportPack>
  );
}
