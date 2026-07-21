import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { FeeMapperFormDialog } from '@features/finance/mapper/components/FeeMapperFormDialog';
import { FeeMapperTable } from '@features/finance/mapper/components/FeeMapperTable';
import {
  useCreateFeeMapper,
  useDeleteFeeMapper,
  useFeeMapper,
  useUpdateFeeMapper,
} from '@hooks/useFeeMapper';
import { useFeeTypes } from '@hooks/useFeeTypes';
import { useLedgersList } from '@hooks/useLedgers';
import type { FeeHeadMapper, FeeHeadMapperPayload } from '@app-types/finance';
import { ModuleListPack } from '@workflow-packs';

export function FeeMapperPage() {
  const { data: rows = [], isLoading, isError, error, refetch } = useFeeMapper();
  const { data: feeTypes = [] } = useFeeTypes();
  const { data: ledgersData } = useLedgersList(1, 100);
  const ledgers = ledgersData?.results ?? [];

  const createMutation = useCreateFeeMapper();
  const updateMutation = useUpdateFeeMapper();
  const deleteMutation = useDeleteFeeMapper();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<FeeHeadMapper | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeHeadMapper | null>(null);

  const closeForm = () => {
    setDialogOpen(false);
    setSelected(null);
  };

  const handleSubmit = (payload: FeeHeadMapperPayload) => {
    if (selected) {
      updateMutation.mutate({ id: selected.fhl_id, payload }, { onSuccess: closeForm });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeForm });
  };

  const addAction = (
    <PermissionButton
      permission="finance.accounts.manage"
      onClick={() => {
        setSelected(null);
        setDialogOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add mapping
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Account Mapper"
      description="Map fee heads to accounting ledgers for fee payment posting."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading mapper..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="No fee-head mappings"
      emptyDescription="Link a fee type to a ledger to enable accounting posts."
      emptyAction={addAction}
      footer={
        <>
          <FeeMapperFormDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (!open) closeForm();
              else setDialogOpen(true);
            }}
            mapper={selected}
            feeTypes={feeTypes}
            ledgers={ledgers}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            title="Delete mapping?"
            description={
              deleteTarget
                ? `Remove mapping #${deleteTarget.fhl_id} (fee head ${deleteTarget.head_id} → ledger ${deleteTarget.ledger_id})?`
                : ''
            }
            confirmLabel="Delete"
            destructive
            onConfirm={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.fhl_id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }}
            isLoading={deleteMutation.isPending}
          />
        </>
      }
    >
      <FeeMapperTable
        rows={rows}
        ledgers={ledgers}
        feeTypes={feeTypes}
        onEdit={(row) => {
          setSelected(row);
          setDialogOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
