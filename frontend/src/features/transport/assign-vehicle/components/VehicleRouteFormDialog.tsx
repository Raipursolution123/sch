import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField } from '@components/forms/fields';
import type { TransportRoute, Vehicle, VehicleRouteAssignment } from '@app-types/transport';
import {
  vehicleRouteFormSchema,
  type VehicleRouteFormValues,
} from '@features/transport/assign-vehicle/schemas/vehicle-route.schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: VehicleRouteAssignment | null;
  routes: TransportRoute[];
  vehicles: Vehicle[];
  onSubmit: (values: VehicleRouteFormValues) => void;
  isLoading?: boolean;
}

const defaults: VehicleRouteFormValues = { route_id: '', vehicle_id: '' };

export function VehicleRouteFormDialog({
  open,
  onOpenChange,
  assignment,
  routes,
  vehicles,
  onSubmit,
  isLoading,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleRouteFormValues>({
    resolver: zodResolver(vehicleRouteFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      assignment
        ? { route_id: String(assignment.route_id), vehicle_id: String(assignment.vehicle_id) }
        : defaults,
    );
  }, [open, assignment, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={assignment ? 'Edit vehicle assignment' : 'Assign vehicle'}
      description="Choose the route and vehicle that will operate it."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={assignment ? 'Save changes' : 'Assign'}
    >
      <FormErrorSummary errors={errors} />
      <FormSelectField
        control={control}
        name="route_id"
        label="Route"
        options={routes.map((route) => ({
          value: String(route.id),
          label: route.route_title || `Route ${route.id}`,
        }))}
        required
      />
      <FormSelectField
        control={control}
        name="vehicle_id"
        label="Vehicle"
        options={vehicles.map((vehicle) => ({
          value: String(vehicle.id),
          label: vehicle.vehicle_no || vehicle.registration_number,
        }))}
        required
      />
    </EntityFormDialog>
  );
}
