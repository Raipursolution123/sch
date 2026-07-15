import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { FeeDiscountFormDialog } from '@features/fees/discounts/components/FeeDiscountFormDialog';
import { FeeDiscountsTable } from '@features/fees/discounts/components/FeeDiscountsTable';
import type { FeeDiscountFormValues } from '@features/fees/discounts/schemas/fee-discount.schema';
import {
  useCreateFeeDiscount,
  useDeleteFeeDiscount,
  useFeeDiscounts,
  useUpdateFeeDiscount,
} from '@hooks/useFeeDiscounts';
import type { FeeDiscount } from '@app-types/fees/fee-discount';
import type { ActiveFlag } from '@app-types/settings/session';
import { ModuleListPack } from '@workflow-packs';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: FeeDiscountFormValues) {
  const description = values.description?.trim();
  return {
    name: values.name,
    code: values.code,
    session_id: values.session_id,
    type: values.type,
    percentage: values.type === 'percentage' ? values.percentage : null,
    amount: values.type === 'fixed' ? values.amount : null,
    description: description ? description : null,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function FeeDiscountsPage() {
  const { data: discounts, isLoading, isError, error, refetch } = useFeeDiscounts();
  const createMutation = useCreateFeeDiscount();
  const updateMutation = useUpdateFeeDiscount();
  const deleteMutation = useDeleteFeeDiscount();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<FeeDiscount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeDiscount | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedDiscount(null);
  };

  const handleFormSubmit = (values: FeeDiscountFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedDiscount) {
      updateMutation.mutate({ id: selectedDiscount.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const addDiscountAction = (
    <PermissionButton
      permission="fees.manage"
      onClick={() => setDialogMode('create')}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add Discount
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Fee Discounts"
      description="Create percentage or fixed discount plans by academic session."
      actions={addDiscountAction}
      isLoading={isLoading}
      loadingMessage="Loading fee discounts..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && discounts?.length === 0}
      emptyTitle="No fee discounts configured"
      emptyDescription="Add a discount plan to apply later when assigning student fees."
      emptyAction={addDiscountAction}
      footer={
        <>
          <FeeDiscountFormDialog
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) closeFormDialog();
            }}
            discount={dialogMode === 'edit' ? selectedDiscount : null}
            onSubmit={handleFormSubmit}
            isLoading={isFormLoading}
          />

          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete fee discount"
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
      <FeeDiscountsTable
        discounts={discounts ?? []}
        onEdit={(discount) => {
          setSelectedDiscount(discount);
          setDialogMode('edit');
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
