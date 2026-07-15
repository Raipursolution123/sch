import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { GradeFormDialog } from '@features/examinations/grades/components/GradeFormDialog';
import { GradesTable } from '@features/examinations/grades/components/GradesTable';
import type { GradeFormValues } from '@features/examinations/grades/schemas/grade.schema';
import { useCreateGrade, useDeleteGrade, useGrades, useUpdateGrade } from '@hooks/useGrades';
import type { Grade } from '@app-types/examinations/grade';
import type { ActiveFlag } from '@app-types/settings/session';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: GradeFormValues) {
  const description = values.description?.trim();
  return {
    exam_type: values.exam_type,
    name: values.name,
    point: values.point,
    mark_from: values.mark_from,
    mark_upto: values.mark_upto,
    description: description ? description : null,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function GradesPage() {
  const { data: grades, isLoading, isError, error, refetch } = useGrades();
  const createMutation = useCreateGrade();
  const updateMutation = useUpdateGrade();
  const deleteMutation = useDeleteGrade();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedGrade(null);
  };

  const handleFormSubmit = (values: GradeFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedGrade) {
      updateMutation.mutate({ id: selectedGrade.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addGradeAction = (
    <PermissionButton
      permission="exams.create"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Grade
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Marks Grade"
      description="Configure grade names, points, and mark ranges used when entering exam results."
      actions={addGradeAction}
      isLoading={isLoading}
      loadingMessage="Loading grades..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (grades?.length ?? 0) === 0}
      emptyTitle="No grades configured"
      emptyDescription="Add a grade scale before publishing exam results."
      emptyAction={addGradeAction}
      footer={
        <>
          <GradeFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            grade={dialogMode === 'edit' ? selectedGrade : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />

          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete grade"
            description={
              deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''
            }
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
          />
        </>
      }
    >
      <GradesTable
        grades={grades ?? []}
        onEdit={(grade) => {
          setSelectedGrade(grade);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
