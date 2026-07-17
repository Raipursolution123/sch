import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import {
  useCreatePickupPoint,
  useDeletePickupPoint,
  usePickupPoints,
  useUpdatePickupPoint,
} from '@hooks/usePickupPoints';
import type { PickupPoint } from '@app-types/transport';
import { PickupPointFormDialog } from '@features/transport/pickup-points/components/PickupPointFormDialog';
import { PickupPointsTable } from '@features/transport/pickup-points/components/PickupPointsTable';
import type { PickupPointFormValues } from '@features/transport/pickup-points/schemas/pickup-point.schema';

export function PickupPointsPage() {
  const { data, isLoading, isError, error, refetch } = usePickupPoints();
  const createMutation = useCreatePickupPoint();
  const updateMutation = useUpdatePickupPoint();
  const deleteMutation = useDeletePickupPoint();
  const [selected, setSelected] = useState<PickupPoint | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PickupPoint | null>(null);

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
      Add Pickup Point
    </PermissionButton>
  );

  const handleSubmit = (values: PickupPointFormValues) => {
    const payload = {
      name: values.name,
      latitude: values.latitude || null,
      longitude: values.longitude || null,
    };
    const options = { onSuccess: () => setFormOpen(false) };
    if (selected) updateMutation.mutate({ id: selected.id, payload }, options);
    else createMutation.mutate(payload, options);
  };

  return (
    <ModuleListPack
      title="Pickup Points"
      description="Manage locations where students board and leave school vehicles."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading pickup points..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No pickup points"
      emptyDescription="Add your first transport pickup location."
      emptyAction={addAction}
      footer={
        <>
          <PickupPointFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            pickupPoint={selected}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete pickup point"
            description={`Delete "${deleteTarget?.name ?? ''}"? This cannot be undone.`}
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
      <PickupPointsTable
        pickupPoints={data ?? []}
        onEdit={(point) => {
          setSelected(point);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
