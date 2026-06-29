import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { ExamGroupFormDialog } from '@features/examinations/exam-groups/components/ExamGroupFormDialog';
import { ExamGroupsTable } from '@features/examinations/exam-groups/components/ExamGroupsTable';
import type { ExamGroupFormValues } from '@features/examinations/exam-groups/schemas/exam-group.schema';
import {
  useCreateExamGroup,
  useDeleteExamGroup,
  useExamGroups,
  useUpdateExamGroup,
} from '@hooks/useExamGroups';
import type { ExamGroup } from '@app-types/examinations/exam-group';
import type { ActiveFlag } from '@app-types/settings/session';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: ExamGroupFormValues) {
  const description = values.description?.trim();
  return {
    name: values.name,
    exam_type: values.exam_type,
    description: description ? description : null,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function ExamGroupsPage() {
  const { data: examGroups, isLoading, isError, error, refetch } = useExamGroups();
  const createMutation = useCreateExamGroup();
  const updateMutation = useUpdateExamGroup();
  const deleteMutation = useDeleteExamGroup();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedExamGroup, setSelectedExamGroup] = useState<ExamGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamGroup | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedExamGroup(null);
  };

  const handleFormSubmit = (values: ExamGroupFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedExamGroup) {
      updateMutation.mutate({ id: selectedExamGroup.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Groups"
        description="Group examinations by type for scheduling and reporting."
        actions={
          <Button onClick={() => setDialogMode('create')} className="gap-1">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Exam Group
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading exam groups..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load exam groups'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && examGroups?.length === 0 && (
        <EmptyState
          title="No exam groups configured"
          description="Create an exam group to organize term, unit, and annual exams."
          action={
            <Button onClick={() => setDialogMode('create')} className="gap-1">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Exam Group
            </Button>
          }
        />
      )}

      {!isLoading && !isError && examGroups && examGroups.length > 0 && (
        <ExamGroupsTable
          examGroups={examGroups}
          onEdit={(examGroup) => {
            setSelectedExamGroup(examGroup);
            setDialogMode('edit');
          }}
          onDelete={setDeleteTarget}
        />
      )}

      <ExamGroupFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        examGroup={dialogMode === 'edit' ? selectedExamGroup : null}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete exam group"
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
