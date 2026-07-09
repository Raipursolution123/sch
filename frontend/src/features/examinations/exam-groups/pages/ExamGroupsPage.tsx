import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
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
import { ModuleListPack } from '@workflow-packs';

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
  const { data: examGroupsData, isLoading, isError, error, refetch } = useExamGroups();
  const examGroups = examGroupsData?.results;
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

  const addExamGroupAction = (
    <PermissionButton
      permission="exams.create"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Exam Group
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Exam Groups"
      description="Group examinations by type for scheduling and reporting."
      actions={addExamGroupAction}
      isLoading={isLoading}
      loadingMessage="Loading exam groups..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && examGroups?.length === 0}
      emptyTitle="No exam groups configured"
      emptyDescription="Create an exam group to organize term, unit, and annual exams."
      emptyAction={addExamGroupAction}
      footer={
        <>
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
        </>
      }
    >
      <ExamGroupsTable
        examGroups={examGroups ?? []}
        onEdit={(examGroup) => {
          setSelectedExamGroup(examGroup);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
