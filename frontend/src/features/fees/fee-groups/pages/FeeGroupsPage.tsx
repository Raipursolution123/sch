import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { FeeGroupFormDialog } from '@features/fees/fee-groups/components/FeeGroupFormDialog';
import { FeeGroupsTable } from '@features/fees/fee-groups/components/FeeGroupsTable';
import type { FeeGroupFormValues } from '@features/fees/fee-groups/schemas/fee-group.schema';
import {
  useCreateFeeGroup,
  useDeleteFeeGroup,
  useFeeGroups,
  useUpdateFeeGroup,
} from '@hooks/useFeeGroups';
import type { FeeGroup } from '@app-types/fees/fee-group';
import type { ActiveFlag } from '@app-types/settings/session';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: FeeGroupFormValues) {
  const description = values.description?.trim();
  return {
    name: values.name,
    description: description ? description : null,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function FeeGroupsPage() {
  const { data: feeGroups, isLoading, isError, error, refetch } = useFeeGroups();
  const createMutation = useCreateFeeGroup();
  const updateMutation = useUpdateFeeGroup();
  const deleteMutation = useDeleteFeeGroup();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedFeeGroup, setSelectedFeeGroup] = useState<FeeGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeGroup | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedFeeGroup(null);
  };

  const handleFormSubmit = (values: FeeGroupFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedFeeGroup) {
      updateMutation.mutate({ id: selectedFeeGroup.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addFeeGroupAction = (
    <PermissionButton
      permission="fees.manage"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Fee Group
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Fee Groups"
      actions={addFeeGroupAction}
      isLoading={isLoading}
      loadingMessage="Loading fee groups..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && feeGroups?.length === 0}
      emptyTitle="No fee groups configured"
      emptyDescription="Create a fee group to organize fee types for class assignments."
      emptyAction={addFeeGroupAction}
      footer={
        <>
          <FeeGroupFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            feeGroup={dialogMode === 'edit' ? selectedFeeGroup : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />

          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete fee group"
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
      <FeeGroupsTable
        feeGroups={feeGroups ?? []}
        onEdit={(feeGroup) => {
          setSelectedFeeGroup(feeGroup);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
