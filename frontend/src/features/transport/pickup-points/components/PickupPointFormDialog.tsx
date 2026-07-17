import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField } from '@components/forms/fields';
import type { PickupPoint } from '@app-types/transport';
import {
  pickupPointFormSchema,
  type PickupPointFormValues,
} from '@features/transport/pickup-points/schemas/pickup-point.schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pickupPoint?: PickupPoint | null;
  onSubmit: (values: PickupPointFormValues) => void;
  isLoading?: boolean;
}

const defaults: PickupPointFormValues = { name: '', latitude: '', longitude: '' };

export function PickupPointFormDialog({
  open,
  onOpenChange,
  pickupPoint,
  onSubmit,
  isLoading,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PickupPointFormValues>({
    resolver: zodResolver(pickupPointFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      pickupPoint
        ? {
            name: pickupPoint.name,
            latitude: pickupPoint.latitude ?? '',
            longitude: pickupPoint.longitude ?? '',
          }
        : defaults,
    );
  }, [open, pickupPoint, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={pickupPoint ? 'Edit pickup point' : 'Add pickup point'}
      description="Create a location that can be used on transport routes."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={pickupPoint ? 'Save changes' : 'Create'}
    >
      <FormErrorSummary errors={errors} />
      <FormTextField control={control} name="name" label="Name" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={control} name="latitude" label="Latitude" optional />
        <FormTextField control={control} name="longitude" label="Longitude" optional />
      </div>
    </EntityFormDialog>
  );
}
