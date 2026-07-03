import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { FeeTypeFormDialog } from '@features/fees/fee-types/components/FeeTypeFormDialog';
import { FeeTypesTable } from '@features/fees/fee-types/components/FeeTypesTable';
import type { FeeTypeFormValues } from '@features/fees/fee-types/schemas/fee-type.schema';
import {
  useCreateFeeType,
  useDeleteFeeType,
  useFeeCategories,
  useFeeTypes,
  useUpdateFeeType,
} from '@hooks/useFeeTypes';
import type { FeeType } from '@app-types/fees/fee-type';
import type { ActiveFlag } from '@app-types/settings/session';

type DialogMode = 'create' | 'edit' | null;

function toPayload(values: FeeTypeFormValues) {
  const description = values.description?.trim();
  return {
    code: values.code,
    name: values.name,
    feecategory_id: values.feecategory_id,
    description: description ? description : null,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

export function FeeTypesPage() {
  const { data: feeTypes, isLoading, isError, error, refetch } = useFeeTypes();
  const { data: categories = [] } = useFeeCategories();
  const createMutation = useCreateFeeType();
  const updateMutation = useUpdateFeeType();
  const deleteMutation = useDeleteFeeType();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeType | null>(null);

  const closeFormDialog = () => {
    setDialogMode(null);
    setSelectedFeeType(null);
  };

  const handleFormSubmit = (values: FeeTypeFormValues) => {
    const payload = toPayload(values);
    if (dialogMode === 'edit' && selectedFeeType) {
      updateMutation.mutate({ id: selectedFeeType.id, payload }, { onSuccess: closeFormDialog });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeFormDialog });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Types"
        description="Define fee types and categories used when building fee packages."
        actions={
          <Button
            onClick={() => setDialogMode('create')}
            className="gap-1"
            disabled={categories.length === 0}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Fee Type
          </Button>
        }
      />

      {isLoading && <LoadingState message="Loading fee types..." />}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load fee types'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && feeTypes?.length === 0 && (
        <EmptyState
          title="No fee types configured"
          description="Add your first fee type to start building fee structures."
          action={
            categories.length > 0 ? (
              <Button onClick={() => setDialogMode('create')} className="gap-1">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Fee Type
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && feeTypes && feeTypes.length > 0 && (
        <FeeTypesTable
          feeTypes={feeTypes}
          onEdit={(feeType) => {
            setSelectedFeeType(feeType);
            setDialogMode('edit');
          }}
          onDelete={setDeleteTarget}
        />
      )}

      <FeeTypeFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        categories={categories}
        feeType={dialogMode === 'edit' ? selectedFeeType : null}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete fee type"
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
