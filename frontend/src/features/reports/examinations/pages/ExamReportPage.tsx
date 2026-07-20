import { useEffect, useMemo, useState } from 'react';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { ReportSummaryGrid } from '@components/reports';
import { ExamReportTable } from '@features/reports/examinations/components/ExamReportTable';
import { useExamResultRoster } from '@hooks/useExamResults';
import { useExamSchedules } from '@hooks/useExamSchedules';
import { useExams } from '@hooks/useExams';
import { exportToCsv } from '@utils/export-csv';
import { printReport } from '@utils/print-report';
import { ModuleReportPack } from '@workflow-packs';

export function ExamReportPage() {
  const { data: examsData } = useExams();
  const exams = examsData?.results || [];
  const { data: schedules = [] } = useExamSchedules();

  const [examId, setExamId] = useState(0);
  const [scheduleId, setScheduleId] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const activeExams = useMemo(() => exams.filter((e) => e.is_active === 'yes'), [exams]);

  const scheduleOptions = useMemo(
    () =>
      schedules
        .filter((s) => s.exam_id === examId && s.is_active === 'yes')
        .map((s) => ({
          value: String(s.id),
          label: s.subject_name
            ? `${s.subject_name}${s.date_of_exam ? ` (${s.date_of_exam})` : ''}`
            : `Subject #${s.subject_id}`,
        })),
    [schedules, examId],
  );

  const filtersReady = submitted && examId > 0 && scheduleId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useExamResultRoster(examId, scheduleId, filtersReady);

  useEffect(() => {
    if (activeExams.length > 0 && examId === 0) {
      setExamId(activeExams[0].id);
    }
  }, [activeExams, examId]);

  useEffect(() => {
    if (examId <= 0) {
      setScheduleId(0);
      return;
    }
    const forExam = schedules.filter((s) => s.exam_id === examId && s.is_active === 'yes');
    if (forExam.length === 0) {
      setScheduleId(0);
      return;
    }
    if (!forExam.some((s) => s.id === scheduleId)) {
      setScheduleId(forExam[0].id);
    }
  }, [examId, schedules, scheduleId]);

  const students = roster?.students ?? [];
  const presentCount = students.filter((s) => s.attendence !== 'absent').length;
  const absentCount = students.length - presentCount;

  const handleExportCsv = () => {
    if (!roster) return;
    exportToCsv(
      `exam-report-${examId}-${scheduleId}`,
      ['Roll', 'Student', 'Admission No.', 'Attendance', 'Marks', 'Note'],
      students.map((row) => [
        row.roll_no != null ? String(row.roll_no) : '',
        row.full_name,
        row.admission_no ?? '',
        row.attendence === 'absent' ? 'Absent' : 'Present',
        row.attendence === 'absent' ? '' : String(row.get_marks),
        row.note ?? '',
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Exam Report"
      description="View entered marks and attendance for a scheduled exam paper."
      printTitle="Exam Report"
      onPrint={printReport}
      onExportCsv={handleExportCsv}
      exportDisabled={students.length === 0}
      onApply={() => setSubmitted(true)}
      applyDisabled={examId <= 0 || scheduleId <= 0 || (submitted && isLoading)}
      submitted={submitted}
      hasData={Boolean(roster)}
      isLoading={filtersReady && isLoading}
      loadingMessage="Loading exam results..."
      isError={filtersReady && isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={filtersReady && !isLoading && !isError && students.length === 0}
      emptyTitle="No results recorded"
      emptyDescription="Enroll students and enter marks before generating this report."
      summary={
        roster ? (
          <ReportSummaryGrid
            items={[
              { label: 'Students', value: students.length },
              { label: 'Present', value: presentCount, tone: 'success' },
              { label: 'Absent', value: absentCount, tone: 'destructive' },
              {
                label: 'Full marks',
                value: roster.full_marks != null ? roster.full_marks : 'Not set',
              },
            ]}
          />
        ) : undefined
      }
      filters={
        <>
          <FormField label="Exam" htmlFor="exam_report_exam">
            <Select
              id="exam_report_exam"
              placeholder="Select exam"
              options={activeExams.map((e) => ({ value: String(e.id), label: e.name }))}
              value={examId ? String(examId) : ''}
              onChange={(e) => {
                setExamId(Number(e.target.value));
                setSubmitted(false);
              }}
              disabled={activeExams.length === 0}
            />
          </FormField>
          <FormField label="Subject paper" htmlFor="exam_report_schedule">
            <Select
              id="exam_report_schedule"
              placeholder="Select schedule"
              options={scheduleOptions}
              value={scheduleId ? String(scheduleId) : ''}
              onChange={(e) => {
                setScheduleId(Number(e.target.value));
                setSubmitted(false);
              }}
              disabled={scheduleOptions.length === 0}
            />
          </FormField>
        </>
      }
    >
      {students.length > 0 && (
        <ExamReportTable students={students} fullMarks={roster?.full_marks ?? null} />
      )}
    </ModuleReportPack>
  );
}
