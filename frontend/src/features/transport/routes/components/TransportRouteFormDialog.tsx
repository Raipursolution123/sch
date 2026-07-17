import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField, FormTextareaField } from '@components/forms/fields';
import type { TransportRoute } from '@app-types/transport';
import {
  transportRouteFormSchema,
  type TransportRouteFormValues,
} from '@features/transport/routes/schemas/transport-route.schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: TransportRoute | null;
  onSubmit: (values: TransportRouteFormValues) => void;
  isLoading?: boolean;
}

const defaults: TransportRouteFormValues = {
  route_title: '',
  route_from: '',
  route_to: '',
  route_distance: '',
  no_of_vehicle: '',
  note: '',
  is_active: true,
};

export function TransportRouteFormDialog({
  open,
  onOpenChange,
  route,
  onSubmit,
  isLoading,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransportRouteFormValues>({
    resolver: zodResolver(transportRouteFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      route
        ? {
            route_title: route.route_title ?? '',
            route_from: route.route_from ?? '',
            route_to: route.route_to ?? '',
            route_distance: route.route_distance == null ? '' : String(route.route_distance),
            no_of_vehicle: route.no_of_vehicle == null ? '' : String(route.no_of_vehicle),
            note: route.note ?? '',
            is_active: route.is_active === 'yes',
          }
        : defaults,
    );
  }, [open, route, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={route ? 'Edit route' : 'Add route'}
      description="Define a transport route and its operating details."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={route ? 'Save changes' : 'Create'}
    >
      <FormErrorSummary errors={errors} />
      <FormTextField control={control} name="route_title" label="Route title" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={control} name="route_from" label="From" optional />
        <FormTextField control={control} name="route_to" label="To" optional />
        <FormTextField
          control={control}
          name="route_distance"
          label="Distance"
          type="number"
          optional
        />
        <FormTextField
          control={control}
          name="no_of_vehicle"
          label="Number of vehicles"
          type="number"
          optional
        />
      </div>
      <FormTextareaField control={control} name="note" label="Note" rows={2} optional />
      <FormSwitchField control={control} name="is_active" label="Active" />
    </EntityFormDialog>
  );
}
