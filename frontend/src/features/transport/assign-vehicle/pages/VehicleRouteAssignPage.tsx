import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import { useTransportRoutes } from '@hooks/useTransportRoutes';
import { useVehicles } from '@hooks/useVehicles';
import {
  useCreateVehicleRoute,
  useDeleteVehicleRoute,
  useUpdateVehicleRoute,
  useVehicleRoutes,
} from '@hooks/useVehicleRoutes';
import type { VehicleRouteAssignment } from '@app-types/transport';
import { VehicleRouteFormDialog } from '@features/transport/assign-vehicle/components/VehicleRouteFormDialog';
import { VehicleRouteAssignmentsTable } from '@features/transport/assign-vehicle/components/VehicleRouteAssignmentsTable';
import type { VehicleRouteFormValues } from '@features/transport/assign-vehicle/schemas/vehicle-route.schema';

export function VehicleRouteAssignPage() {
  const { data, isLoading, isError, error, refetch } = useVehicleRoutes();
  const { data: routes = [] } = useTransportRoutes();
  const { data: vehicles = [] } = useVehicles();
  const createMutation = useCreateVehicleRoute();
  const updateMutation = useUpdateVehicleRoute();
  const deleteMutation = useDeleteVehicleRoute();
  const [selected, setSelected] = useState<VehicleRouteAssignment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VehicleRouteAssignment | null>(null);

  const addAction = (
    <PermissionButton
      permission="transport.create"
      disabled={routes.length === 0 || vehicles.length === 0}
      onClick={() => {
        setSelected(null);
        setFormOpen(true);
      }}
      className="gap-1"
    >
      <Plus className="h-4 w-4" />
      Assign Vehicle
    </PermissionButton>
  );

  const handleSubmit = (values: VehicleRouteFormValues) => {
    const payload = { route_id: Number(values.route_id), vehicle_id: Number(values.vehicle_id) };
    const options = { onSuccess: () => setFormOpen(false) };
    if (selected) updateMutation.mutate({ id: selected.id, payload }, options);
    else createMutation.mutate(payload, options);
  };

  return (
    <ModuleListPack
      title="Assign Vehicles"
      description="Connect vehicles to the routes they operate."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading vehicle assignments..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No vehicle assignments"
      emptyDescription="Create routes and vehicles, then connect them here."
      emptyAction={addAction}
      footer={
        <>
          <VehicleRouteFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            assignment={selected}
            routes={routes}
            vehicles={vehicles}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Remove vehicle assignment"
            description="Remove this vehicle from the route?"
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
      <VehicleRouteAssignmentsTable
        assignments={data ?? []}
        onEdit={(assignment) => {
          setSelected(assignment);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
