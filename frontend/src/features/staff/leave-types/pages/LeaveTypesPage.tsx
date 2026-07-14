import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { LeaveTypeFormDialog } from '@features/staff/leave-types/components/LeaveTypeFormDialog';
import { LeaveTypesTable } from '@features/staff/leave-types/components/LeaveTypesTable';
import type { LeaveTypeFormValues } from '@features/staff/leave-types/schemas/leave-type.schema';
import {
  useCreateLeaveType,
  useDeleteLeaveType,
  useLeaveTypes,
  useUpdateLeaveType,
} from '@hooks/useLeaveTypes';
import type { LeaveType } from '@app-types/staff/leave-type';
import type { ActiveFlag } from '@app-types/settings/session';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: LeaveTypeFormValues) {
  return {
    name: values.name,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function LeaveTypesPage() {
  const { data: leaveTypes, isLoading, isError, error, refetch } = useLeaveTypes();
  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();
  const deleteMutation = useDeleteLeaveType();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<LeaveType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeaveType | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelected(null);
  };

  const handleFormSubmit = (values: LeaveTypeFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selected) {
      updateMutation.mutate({ id: selected.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addAction = (
    <PermissionButton
      permission="staff.create"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Leave Type
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Leave Types"
      description="Configure HR leave categories used when staff apply for leave."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading leave types..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (leaveTypes?.length ?? 0) === 0}
      emptyTitle="No leave types"
      emptyDescription="Add leave types before creating leave requests."
      emptyAction={addAction}
      footer={
        <>
          <LeaveTypeFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            leaveType={dialogMode === 'edit' ? selected : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete leave type"
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
      <LeaveTypesTable
        leaveTypes={leaveTypes ?? []}
        onEdit={(row) => {
          setSelected(row);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
