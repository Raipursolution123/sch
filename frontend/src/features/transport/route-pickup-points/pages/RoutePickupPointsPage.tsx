import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import { RoutePickupPointsTable } from '@features/transport/route-pickup-points/components/RoutePickupPointsTable';
import { RoutePickupPointFormDialog } from '@features/transport/route-pickup-points/components/RoutePickupPointFormDialog';
import type { RoutePickupPointFormValues } from '@features/transport/route-pickup-points/schemas/route-pickup-point.schema';
import {
  useCreateRoutePickupPoint,
  useDeleteRoutePickupPoint,
  useRoutePickupPoints,
  useUpdateRoutePickupPoint,
} from '@hooks/useRoutePickupPoints';
import { usePickupPoints } from '@hooks/usePickupPoints';
import { useTransportRoutes } from '@hooks/useTransportRoutes';
import type { RoutePickupPoint } from '@app-types/transport';

export function RoutePickupPointsPage() {
  const { data: assignments, isLoading, isError, error, refetch } = useRoutePickupPoints();
  const { data: routes = [] } = useTransportRoutes();
  const { data: pickupPoints = [] } = usePickupPoints();
  const createMutation = useCreateRoutePickupPoint();
  const updateMutation = useUpdateRoutePickupPoint();
  const deleteMutation = useDeleteRoutePickupPoint();

  const [selected, setSelected] = useState<RoutePickupPoint | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoutePickupPoint | null>(null);

  const handleSubmit = (values: RoutePickupPointFormValues) => {
    if (selected) {
      updateMutation.mutate(
        {
          id: selected.id,
          payload: {
            fees: values.fees,
            destination_distance: values.destination_distance,
            pickup_time: values.pickup_time?.trim() || null,
            order_number: values.order_number?.trim() ?? '',
          },
        },
        { onSuccess: () => setFormOpen(false) },
      );
      return;
    }

    createMutation.mutate(
      {
        transport_route_id: Number(values.transport_route_id),
        pickup_point_id: Number(values.pickup_point_id),
        fees: values.fees,
        destination_distance: values.destination_distance,
        pickup_time: values.pickup_time?.trim() || null,
        order_number: values.order_number?.trim() ?? '',
      },
      { onSuccess: () => setFormOpen(false) },
    );
  };

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
      Assign Pickup Point
    </PermissionButton>
  );

  return (
    <ModuleListPack
      title="Route Pickup Points"
      description="Assign pickup points to transport routes with fees and pickup times."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading route pickup points..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (assignments?.length ?? 0) === 0}
      emptyTitle="No route pickup points"
      emptyDescription="Assign the first pickup point to a route."
      emptyAction={addAction}
      footer={
        <>
          <RoutePickupPointFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            assignment={selected}
            routes={routes}
            pickupPoints={pickupPoints}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Remove pickup point assignment"
            description="Remove this pickup point from the route? This cannot be undone."
            confirmLabel="Remove"
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
      <RoutePickupPointsTable
        assignments={assignments ?? []}
        routes={routes}
        pickupPoints={pickupPoints}
        onEdit={(row) => {
          setSelected(row);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
