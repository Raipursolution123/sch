import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField, FormNumberField } from '@components/forms/fields';
import type { PickupPoint, RoutePickupPoint, TransportRoute } from '@app-types/transport';
import {
  routePickupPointFormSchema,
  type RoutePickupPointFormValues,
} from '@features/transport/route-pickup-points/schemas/route-pickup-point.schema';

interface RoutePickupPointFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: RoutePickupPoint | null;
  routes: TransportRoute[];
  pickupPoints: PickupPoint[];
  onSubmit: (values: RoutePickupPointFormValues) => void;
  isLoading?: boolean;
}

const defaults: RoutePickupPointFormValues = {
  transport_route_id: '',
  pickup_point_id: '',
  fees: 0,
  destination_distance: 0,
  pickup_time: '',
  order_number: '',
};

export function RoutePickupPointFormDialog({
  open,
  onOpenChange,
  assignment,
  routes,
  pickupPoints,
  onSubmit,
  isLoading,
}: RoutePickupPointFormDialogProps) {
  const isEdit = Boolean(assignment);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoutePickupPointFormValues>({
    resolver: zodResolver(routePickupPointFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && assignment) {
      reset({
        transport_route_id: String(assignment.transport_route_id),
        pickup_point_id: String(assignment.pickup_point_id),
        fees: assignment.fees ?? 0,
        destination_distance: assignment.destination_distance ?? 0,
        pickup_time: assignment.pickup_time ?? '',
        order_number: assignment.order_number ?? '',
      });
      return;
    }
    reset(defaults);
  }, [open, isEdit, assignment, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit route pickup point' : 'Assign pickup point'}
      description="Assign a pickup point to a transport route with fees and timing."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={isEdit ? 'Save' : 'Assign'}
      size="lg"
    >
      <FormErrorSummary errors={errors} />
      <FormSelectField
        control={control}
        name="transport_route_id"
        label="Route"
        options={routes.map((route) => ({
          value: String(route.id),
          label: route.route_title || `Route ${route.id}`,
        }))}
        required
        disabled={isEdit}
      />
      <FormSelectField
        control={control}
        name="pickup_point_id"
        label="Pickup point"
        options={pickupPoints.map((point) => ({
          value: String(point.id),
          label: point.name,
        }))}
        required
        disabled={isEdit}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormNumberField control={control} name="fees" label="Fees" optional />
        <FormNumberField control={control} name="destination_distance" label="Distance" optional />
        <FormTextField
          control={control}
          name="pickup_time"
          label="Pickup time"
          type="time"
          optional
        />
        <FormTextField control={control} name="order_number" label="Order" optional />
      </div>
    </EntityFormDialog>
  );
}
