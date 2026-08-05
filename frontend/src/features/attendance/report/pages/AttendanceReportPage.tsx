import { useEffect, useMemo, useState } from 'react';
import { Input } from '@components/ui/input';
import { Combobox } from '@components/ui/combobox';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { AttendanceReportTable } from '@features/attendance/report/components/AttendanceReportTable';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { useAttendanceReport } from '@hooks/useAttendance';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useActiveSession } from '@hooks/useSessions';
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
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];

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

  const classOptions = useMemo(
    () => [
      { value: '', label: 'All classes' },
      ...classes
        .filter((c) => c.is_active === 'yes')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => ({ value: String(c.id), label: c.class_name })),
    ],
    [classes],
  );

  const sectionOptions = useMemo(() => {
    if (classId > 0) {
      const sorted = [...sectionOptionsForClass(classSections, classId)].sort((a, b) =>
        a.label.localeCompare(b.label),
      );
      if (sorted.length === 0) {
        return [
          { value: '', label: 'All sections' },
          { value: '0', label: 'No Sections (Auto-Selected)' },
        ];
      }
      return [{ value: '', label: 'All sections' }, ...sorted];
    }

    const seen = new Map<number, string>();
    for (const row of classSections) {
      if (row.is_active === 'no') continue;
      seen.set(row.section_id, row.section_name);
    }
    const sorted = Array.from(seen.entries())
      .map(([value, label]) => ({ value: String(value), label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: '', label: 'All sections' }, ...sorted];
  }, [classId, classSections]);

  useEffect(() => {
    if (classId <= 0) return;
    if (sectionId > 0 && !sectionOptions.some((o) => Number(o.value) === sectionId)) {
      setSectionId(0);
      setSubmitted(false);
    }
  }, [classId, sectionId, sectionOptions]);

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

  const attendanceRate =
    report && report.total_records > 0
      ? Math.round((report.present / report.total_records) * 100)
      : null;

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
      emptyTitle="No attendance recorded"
      emptyDescription="No marks in this range. Widen the dates, clear class filters, or mark attendance first."
      summary={
        report ? (
          <ReportSummaryGrid
            className="lg:grid-cols-7"
            items={[
              { label: 'Records', value: report.total_records },
              {
                label: 'Present rate',
                value: attendanceRate != null ? `${attendanceRate}%` : '—',
                tone: 'success',
              },
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
              max={todayIsoDate()}
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
              max={todayIsoDate()}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setSubmitted(false);
              }}
            />
          </FormField>
          <FormField label="Class" htmlFor="report_class">
            <Combobox
              id="report_class"
              options={classOptions}
              value={classId ? String(classId) : ''}
              onValueChange={(v) => {
                const next = v ? Number(v) : 0;
                setClassId(next);
                setSectionId(0);
                setSubmitted(false);
              }}
              allowEmpty
              emptyLabel="All classes"
              placeholder="All classes"
              searchPlaceholder="Search class…"
            />
          </FormField>
          <FormField label="Section" htmlFor="report_section">
            <Combobox
              id="report_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onValueChange={(v) => {
                setSectionId(v ? Number(v) : 0);
                setSubmitted(false);
              }}
              allowEmpty
              emptyLabel="All sections"
              placeholder="All sections"
              searchPlaceholder="Search section…"
            />
          </FormField>
        </>
      }
    >
      {report && report.rows.length > 0 && <AttendanceReportTable rows={report.rows} />}
    </ModuleReportPack>
  );
}
