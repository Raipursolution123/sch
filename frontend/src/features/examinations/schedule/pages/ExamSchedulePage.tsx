import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { ExamScheduleFormDialog } from '@features/examinations/schedule/components/ExamScheduleFormDialog';
import { ExamSchedulesTable } from '@features/examinations/schedule/components/ExamSchedulesTable';
import type { ExamScheduleFormValues } from '@features/examinations/schedule/schemas/exam-schedule.schema';
import {
  useCreateExamSchedule,
  useDeleteExamSchedule,
  useExamSchedules,
  useUpdateExamSchedule,
} from '@hooks/useExamSchedules';
import { useExams } from '@hooks/useExams';
import { useSubjects } from '@hooks/useSubjects';
import { useSessions } from '@hooks/useSessions';
import type { ExamSchedule } from '@app-types/examinations/exam-schedule';
import type { ActiveFlag } from '@app-types/settings/session';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: ExamScheduleFormValues) {
  const roomNo = values.room_no?.trim();
  const note = values.note?.trim();
  return {
    exam_id: values.exam_id,
    subject_id: values.subject_id,
    session_id: values.session_id,
    date_of_exam: values.date_of_exam?.trim() ? values.date_of_exam : null,
    start_time: values.start_time?.trim() ? values.start_time : null,
    end_time: values.end_time?.trim() ? values.end_time : null,
    room_no: roomNo ? roomNo : null,
    full_marks: values.full_marks,
    passing_marks: values.passing_marks,
    note: note ? note : null,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function ExamSchedulePage() {
  const { data: schedules, isLoading, isError, error, refetch } = useExamSchedules();
  const { data: examsData } = useExams();
  const exams = examsData?.results || [];
  const { data: subjectsData } = useSubjects();
  const subjects = subjectsData?.results ?? [];
  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results || [];
  const createMutation = useCreateExamSchedule();
  const updateMutation = useUpdateExamSchedule();
  const deleteMutation = useDeleteExamSchedule();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamSchedule | null>(null);

  const canSchedule = useMemo(
    () =>
      exams.some((e) => e.is_active === 'yes') &&
      subjects.some((s) => s.is_active === 'yes') &&
      sessions.length > 0,
    [exams, subjects, sessions],
  );

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedSchedule(null);
  };

  const handleFormSubmit = (values: ExamScheduleFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedSchedule) {
      updateMutation.mutate({ id: selectedSchedule.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Schedule"
        description="Schedule subject papers with dates, times, rooms, and marking details."
        actions={
          <Button
            onClick={() => setDialogMode('create')}
            className="gap-1"
            disabled={!canSchedule}
            title={canSchedule ? undefined : 'Configure exams, subjects, and sessions first'}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Schedule
          </Button>
        }
      />

      {!canSchedule && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Set up exams, subjects, and academic sessions before scheduling papers.
        </p>
      )}

      {isLoading && <LoadingState message="Loading exam schedules..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load exam schedules'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && schedules?.length === 0 && (
        <EmptyState
          title="No exam schedules"
          description="Add a schedule entry to assign subject papers to exam dates."
          action={
            canSchedule ? (
              <Button onClick={() => setDialogMode('create')} className="gap-1">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Schedule
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && schedules && schedules.length > 0 && (
        <ExamSchedulesTable
          schedules={schedules}
          onEdit={(schedule) => {
            setSelectedSchedule(schedule);
            setDialogMode('edit');
          }}
          onDelete={setDeleteTarget}
        />
      )}

      <ExamScheduleFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        exams={exams}
        subjects={subjects}
        sessions={sessions}
        schedule={dialogMode === 'edit' ? selectedSchedule : null}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete exam schedule"
        description={
          deleteTarget
            ? `Delete the "${deleteTarget.subject_name}" schedule for ${deleteTarget.exam_name}?`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
