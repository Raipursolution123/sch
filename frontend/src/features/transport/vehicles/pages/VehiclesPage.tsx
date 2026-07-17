import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { ModuleListPack } from '@workflow-packs';
import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehicles,
} from '@hooks/useVehicles';
import type { Vehicle } from '@app-types/transport';
import { VehicleFormDialog } from '@features/transport/vehicles/components/VehicleFormDialog';
import { VehiclesTable } from '@features/transport/vehicles/components/VehiclesTable';
import type { VehicleFormValues } from '@features/transport/vehicles/schemas/vehicle.schema';

export function VehiclesPage() {
  const { data, isLoading, isError, error, refetch } = useVehicles();
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

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
      Add Vehicle
    </PermissionButton>
  );

  const handleSubmit = (values: VehicleFormValues) => {
    const payload = {
      ...values,
      vehicle_no: values.vehicle_no || null,
      driver_name: values.driver_name || null,
      driver_contact: values.driver_contact || null,
    };
    const options = { onSuccess: () => setFormOpen(false) };
    if (selected) updateMutation.mutate({ id: selected.id, payload }, options);
    else createMutation.mutate(payload, options);
  };

  return (
    <ModuleListPack
      title="Vehicles"
      description="Manage the school vehicle fleet and driver contact details."
      actions={addAction}
      isLoading={isLoading}
      loadingMessage="Loading vehicles..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyTitle="No vehicles"
      emptyDescription="Add a vehicle before assigning it to a route."
      emptyAction={addAction}
      footer={
        <>
          <VehicleFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            vehicle={selected}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
          <ConfirmDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete vehicle"
            description={`Delete "${deleteTarget?.registration_number ?? ''}"? This cannot be undone.`}
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
      <VehiclesTable
        vehicles={data ?? []}
        onEdit={(vehicle) => {
          setSelected(vehicle);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
    </ModuleListPack>
  );
}
