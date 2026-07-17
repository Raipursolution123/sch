import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import { useSessions } from '@hooks/useSessions';
import {
  useCreateTransportFee,
  useDeleteTransportFee,
  useTransportFees,
  useUpdateTransportFee,
} from '@hooks/useTransportFees';
import type { TransportFeeMaster } from '@app-types/transport';
import { TransportFeeFormDialog } from '@features/transport/fees/components/TransportFeeFormDialog';
import { TransportFeesTable } from '@features/transport/fees/components/TransportFeesTable';
import type { TransportFeeFormValues } from '@features/transport/fees/schemas/transport-fee.schema';

const optionalNumber = (value: string) => (value === '' ? null : Number(value));

export function TransportFeesPage() {
  const { data, isLoading, isError, error, refetch } = useTransportFees();
  const { data: sessionsData } = useSessions();
  const createMutation = useCreateTransportFee();
  const updateMutation = useUpdateTransportFee();
  const deleteMutation = useDeleteTransportFee();
  const [selected, setSelected] = useState<TransportFeeMaster | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransportFeeMaster | null>(null);
  const sessions = (sessionsData?.results ?? []).map((session) => ({
    value: String(session.id),
    label: session.session,
  }));

  const addAction = (
    <PermissionButton
      permission="transport.create"
      onClick={() => {
        setSelected(null);
        setFormOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Add Transport Fee
    </PermissionButton>
  );

  const handleSubmit = (values: TransportFeeFormValues) => {
    const payload = {
      session_id: Number(values.session_id),
      month: values.month || null,
      due_date: values.due_date || null,
      fine_amount: optionalNumber(values.fine_amount),
      fine_type: values.fine_type || null,
      fine_percentage: optionalNumber(values.fine_percentage),
    };
    const options = { onSuccess: () => setFormOpen(false) };
    if (selected) updateMutation.mutate({ id: selected.id, payload }, options);
    else createMutation.mutate(payload, options);
  };

  return (
    <ModuleListPack
      title="Transport Fees"
      description="Configure transport billing periods, due dates, and fines."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading transport fees..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No transport fees"
      emptyDescription="Add a transport fee configuration to get started."
      emptyAction={addAction}
      footer={
        <>
          <TransportFeeFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            fee={selected}
            sessions={sessions}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete transport fee"
            description={`Delete "${deleteTarget?.month ?? 'this fee'}"? This cannot be undone.`}
            confirmLabel="Delete"
            destructive
            isLoading={deleteMutation.isPending}
            onConfirm={() =>
              deleteTarget &&
              deleteMutation.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              })
            }
          />
        </>
      }
    >
      <TransportFeesTable
        fees={data ?? []}
        onEdit={(fee) => {
          setSelected(fee);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
