import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { MarkDivisionFormDialog } from '@features/examinations/divisions/components/MarkDivisionFormDialog';
import { MarkDivisionsTable } from '@features/examinations/divisions/components/MarkDivisionsTable';
import type { MarkDivisionFormValues } from '@features/examinations/divisions/schemas/mark-division.schema';
import {
  useCreateMarkDivision,
  useDeleteMarkDivision,
  useMarkDivisions,
  useUpdateMarkDivision,
} from '@hooks/useMarkDivisions';
import type { MarkDivision } from '@app-types/examinations/mark-division';
import type { ActiveFlag } from '@app-types/settings/session';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: MarkDivisionFormValues) {
  return {
    name: values.name,
    percentage_from: values.percentage_from,
    percentage_to: values.percentage_to,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function MarkDivisionsPage() {
  const { data: divisions, isLoading, isError, error, refetch } = useMarkDivisions();
  const createMutation = useCreateMarkDivision();
  const updateMutation = useUpdateMarkDivision();
  const deleteMutation = useDeleteMarkDivision();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedDivision, setSelectedDivision] = useState<MarkDivision | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarkDivision | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedDivision(null);
  };

  const handleFormSubmit = (values: MarkDivisionFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedDivision) {
      updateMutation.mutate({ id: selectedDivision.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addDivisionAction = (
    <PermissionButton
      permission="exams.create"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Division
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Marks Division"
      description="Configure percentage bands used to label overall exam result divisions."
      actions={addDivisionAction}
      isLoading={isLoading}
      loadingMessage="Loading mark divisions..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (divisions?.length ?? 0) === 0}
      emptyTitle="No mark divisions configured"
      emptyDescription="Add percentage bands such as First, Second, or Pass."
      emptyAction={addDivisionAction}
      footer={
        <>
          <MarkDivisionFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            division={dialogMode === 'edit' ? selectedDivision : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />

          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete mark division"
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
      <MarkDivisionsTable
        divisions={divisions ?? []}
        onEdit={(division) => {
          setSelectedDivision(division);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
