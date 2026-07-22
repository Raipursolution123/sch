import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { FeeAssignmentFormDialog } from '@features/fees/assign/components/FeeAssignmentFormDialog';
import { FeeAssignmentsTable } from '@features/fees/assign/components/FeeAssignmentsTable';
import type { FeeAssignmentFormValues } from '@features/fees/assign/schemas/fee-assignment.schema';
import {
  useCreateFeeAssignment,
  useDeleteFeeAssignment,
  useFeeAssignments,
  useUpdateFeeAssignment,
} from '@hooks/useFeeAssignments';
import { useClasses } from '@hooks/useClasses';
import { useFeeGroups } from '@hooks/useFeeGroups';
import { useFeeTypes } from '@hooks/useFeeTypes';
import { useSessions } from '@hooks/useSessions';
import type { FeeAssignment } from '@app-types/fees/fee-assignment';
import type { ActiveFlag } from '@app-types/settings/session';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: FeeAssignmentFormValues) {
  return {
    class_id: values.class_id,
    fee_group_id: values.fee_group_id,
    session_id: values.session_id,
    lines: values.lines.map((line) => ({
      feetype_id: line.feetype_id,
      amount: line.amount,
      due_date: line.due_date?.trim() ? line.due_date : null,
    })),
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function FeeAssignPage() {
  const { data: assignments, isLoading, isError, error, refetch } = useFeeAssignments();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: feeGroups = [] } = useFeeGroups();
  const { data: feeTypes = [] } = useFeeTypes();
  const { data: sessionsData } = useSessions();
  const sessions = sessionsData?.results || [];
  const createMutation = useCreateFeeAssignment();
  const updateMutation = useUpdateFeeAssignment();
  const deleteMutation = useDeleteFeeAssignment();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<FeeAssignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeAssignment | null>(null);

  const canAssign = useMemo(
    () =>
      classes.some((c) => c.is_active === 'yes') &&
      feeGroups.some((g) => g.is_active === 'yes') &&
      feeTypes.some((f) => f.is_active === 'yes') &&
      sessions.length > 0,
    [classes, feeGroups, feeTypes, sessions],
  );

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedAssignment(null);
  };

  const handleFormSubmit = (values: FeeAssignmentFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedAssignment) {
      updateMutation.mutate({ id: selectedAssignment.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const assignAction = (
    <PermissionButton
      permission="fees.manage"
      onClick={() => setDialogMode('create')}
      className="gap-1"
      disabled={!canAssign}
      title={canAssign ? undefined : 'Configure classes, fee types, groups, and sessions first'}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add fee structure
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Fees Master"
      description="Define session fee structures by class and fee group. Assign them to students from Assign Fees."
      actions={assignAction}
      prerequisiteHint={
        !canAssign && !isLoading ? (
          <p className="text-sm text-muted-foreground">
            Set up fee types, fee groups, classes, and academic sessions before creating fee
            structures.
          </p>
        ) : undefined
      }
      isLoading={isLoading}
      loadingMessage="Loading fee assignments..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && assignments?.length === 0}
      emptyTitle="No fee structures"
      emptyDescription="Create a fee structure for a class and fee group to define what students owe."
      emptyAction={canAssign ? assignAction : undefined}
      footer={
        <>
          <FeeAssignmentFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            classes={classes}
            feeGroups={feeGroups}
            feeTypes={feeTypes}
            sessions={sessions}
            assignment={dialogMode === 'edit' ? selectedAssignment : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />

          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete fee assignment"
            description={
              deleteTarget
                ? `Delete the "${deleteTarget.fee_group_name}" assignment for ${deleteTarget.class_name}?`
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
        </>
      }
    >
      <FeeAssignmentsTable
        assignments={assignments ?? []}
        onEdit={(assignment) => {
          setSelectedAssignment(assignment);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
