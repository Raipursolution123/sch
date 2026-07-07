import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { ExamFormDialog } from '@features/examinations/exams/components/ExamFormDialog';
import { ExamsTable } from '@features/examinations/exams/components/ExamsTable';
import type { ExamFormValues } from '@features/examinations/exams/schemas/exam.schema';
import { useCreateExam, useDeleteExam, useExams, useUpdateExam } from '@hooks/useExams';
import { useExamGroups } from '@hooks/useExamGroups';
import { useSessions } from '@hooks/useSessions';
import type { Exam } from '@app-types/examinations/exam';
import type { ActiveFlag } from '@app-types/settings/session';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: ExamFormValues) {
  const description = values.description?.trim();
  return {
    name: values.name,
    exam_group_id: values.exam_group_id,
    session_id: values.session_id,
    date_from: values.date_from?.trim() ? values.date_from : null,
    date_to: values.date_to?.trim() ? values.date_to : null,
    passing_percentage: values.passing_percentage,
    is_published: values.is_published,
    description: description ? description : null,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function ExamsPage() {
  const { data: exams, isLoading, isError, error, refetch } = useExams();
  const { data: examGroupsData } = useExamGroups();
  const examGroups = examGroupsData?.results || [];
  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results || [];
  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();
  const deleteMutation = useDeleteExam();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);

  const canCreate = useMemo(
    () => examGroups.some((g) => g.is_active === 'yes') && sessions.length > 0,
    [examGroups, sessions],
  );

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedExam(null);
  };

  const handleFormSubmit = (values: ExamFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedExam) {
      updateMutation.mutate({ id: selectedExam.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Manage examination windows, passing criteria, and publication status."
        actions={
          <Button
            onClick={() => setDialogMode('create')}
            className="gap-1"
            disabled={!canCreate}
            title={canCreate ? undefined : 'Configure exam groups and sessions first'}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Exam
          </Button>
        }
      />

      {!canCreate && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Set up exam groups and academic sessions before creating exams.
        </p>
      )}

      {isLoading && <LoadingState message="Loading exams..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load exams'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && exams?.length === 0 && (
        <EmptyState
          title="No exams configured"
          description="Create an exam to define assessment windows for a session."
          action={
            canCreate ? (
              <Button onClick={() => setDialogMode('create')} className="gap-1">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Exam
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && exams && exams.length > 0 && (
        <ExamsTable
          exams={exams}
          onEdit={(exam) => {
            setSelectedExam(exam);
            setDialogMode('edit');
          }}
          onDelete={setDeleteTarget}
        />
      )}

      <ExamFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        examGroups={examGroups}
        sessions={sessions}
        exam={dialogMode === 'edit' ? selectedExam : null}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete exam"
        description={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
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
