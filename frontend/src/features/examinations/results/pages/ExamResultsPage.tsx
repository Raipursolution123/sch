import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { FormField } from '@components/forms/FormField';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import {
  ExamResultsTable,
  type ExamResultRow,
} from '@features/examinations/results/components/ExamResultsTable';
import { useExamResultRoster, useSaveExamResults } from '@hooks/useExamResults';
import { useExamSchedules } from '@hooks/useExamSchedules';
import { useExams } from '@hooks/useExams';
import type { ExamResultAttendence } from '@app-types/examinations/exam-result';
import { ModuleMarkGridPack } from '@workflow-packs';

export function ExamResultsPage() {
  const { data: examsData } = useExams();
  const exams = examsData?.results || [];
  const { data: schedules = [] } = useExamSchedules();

  const [examId, setExamId] = useState(0);
  const [scheduleId, setScheduleId] = useState(0);
  const [rows, setRows] = useState<ExamResultRow[]>([]);

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

  const filtersReady = examId > 0 && scheduleId > 0;
  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useExamResultRoster(examId, scheduleId, filtersReady);

  const saveMutation = useSaveExamResults();

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

  useEffect(() => {
    if (roster) {
      setRows(roster.students);
    }
  }, [roster]);

  const canEnter = activeExams.length > 0 && schedules.some((s) => s.is_active === 'yes');

  const handleMarksChange = (enrollmentId: number, marks: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.exam_group_class_batch_exam_student_id === enrollmentId
          ? { ...row, get_marks: marks }
          : row,
      ),
    );
  };

  const handleAttendenceChange = (enrollmentId: number, attendence: ExamResultAttendence) => {
    setRows((prev) =>
      prev.map((row) =>
        row.exam_group_class_batch_exam_student_id === enrollmentId
          ? {
              ...row,
              attendence,
              get_marks: attendence === 'absent' ? 0 : row.get_marks,
            }
          : row,
      ),
    );
  };

  const handleNoteChange = (enrollmentId: number, note: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.exam_group_class_batch_exam_student_id === enrollmentId ? { ...row, note } : row,
      ),
    );
  };

  const handleSave = () => {
    if (!filtersReady || rows.length === 0) return;
    saveMutation.mutate({
      exam_id: examId,
      schedule_id: scheduleId,
      entries: rows.map((row) => ({
        exam_group_class_batch_exam_student_id: row.exam_group_class_batch_exam_student_id,
        exam_group_student_id: row.exam_group_student_id,
        get_marks: row.attendence === 'absent' ? 0 : row.get_marks,
        attendence: (row.attendence === 'absent' ? 'absent' : 'present') as ExamResultAttendence,
        note: row.note?.trim() ? row.note.trim() : null,
      })),
    });
  };

  return (
    <ModuleMarkGridPack
      title="Exam Results"
      description="Select an exam and scheduled subject, then enter attendance and marks for enrolled students."
      prerequisiteHint={
        !canEnter ? (
          <p className="text-sm text-muted-foreground">
            Create an active exam and subject schedule, and enroll students before entering results.
          </p>
        ) : undefined
      }
      filters={
        <>
          <FormField label="Exam" htmlFor="exam_results_exam">
            <Select
              id="exam_results_exam"
              placeholder="Select exam"
              options={activeExams.map((e) => ({
                value: String(e.id),
                label: e.name,
              }))}
              value={examId ? String(examId) : ''}
              onChange={(e) => setExamId(Number(e.target.value))}
              disabled={!canEnter}
            />
          </FormField>
          <FormField label="Subject paper" htmlFor="exam_results_schedule">
            <Select
              id="exam_results_schedule"
              placeholder="Select schedule"
              options={scheduleOptions}
              value={scheduleId ? String(scheduleId) : ''}
              onChange={(e) => setScheduleId(Number(e.target.value))}
              disabled={!canEnter || scheduleOptions.length === 0}
            />
          </FormField>
          {roster ? (
            <FormField label="Full marks" htmlFor="exam_results_full_marks">
              <Input
                id="exam_results_full_marks"
                value={roster.full_marks != null ? String(roster.full_marks) : 'Not set'}
                disabled
              />
            </FormField>
          ) : null}
        </>
      }
      actions={
        <PermissionButton
          permission="exams.edit"
          disabled={!filtersReady || rows.length === 0 || saveMutation.isPending}
          onClick={handleSave}
          className="gap-1"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save results
        </PermissionButton>
      }
      isLoading={filtersReady && isLoading}
      loadingMessage="Loading exam result roster..."
      isError={filtersReady && isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={filtersReady && !isLoading && !isError && rows.length === 0}
      emptyTitle="No enrolled students"
      emptyDescription="Enroll students in this exam before entering marks."
    >
      {filtersReady && rows.length > 0 ? (
        <ExamResultsTable
          students={rows}
          fullMarks={roster?.full_marks ?? null}
          onMarksChange={handleMarksChange}
          onAttendenceChange={handleAttendenceChange}
          onNoteChange={handleNoteChange}
        />
      ) : null}
    </ModuleMarkGridPack>
  );
}
