import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField } from '@components/forms/fields';
import type { Vehicle } from '@app-types/transport';
import {
  vehicleFormSchema,
  type VehicleFormValues,
} from '@features/transport/vehicles/schemas/vehicle.schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
  onSubmit: (values: VehicleFormValues) => void;
  isLoading?: boolean;
}

const defaults: VehicleFormValues = {
  registration_number: '',
  chasis_number: '',
  max_seating_capacity: '',
  vehicle_no: '',
  driver_name: '',
  driver_contact: '',
  v_name: '',
  v_color: '',
  v_group: '',
  v_api_url: '',
};

export function VehicleFormDialog({ open, onOpenChange, vehicle, onSubmit, isLoading }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      vehicle
        ? {
            registration_number: vehicle.registration_number,
            chasis_number: vehicle.chasis_number,
            max_seating_capacity: vehicle.max_seating_capacity,
            vehicle_no: vehicle.vehicle_no ?? '',
            driver_name: vehicle.driver_name ?? '',
            driver_contact: vehicle.driver_contact ?? '',
            v_name: vehicle.v_name ?? '',
            v_color: vehicle.v_color ?? '',
            v_group: vehicle.v_group ?? '',
            v_api_url: vehicle.v_api_url ?? '',
          }
        : defaults,
    );
  }, [open, vehicle, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={vehicle ? 'Edit vehicle' : 'Add vehicle'}
      description="Record the vehicle, driver, and optional tracking details."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={vehicle ? 'Save changes' : 'Create'}
    >
      <FormErrorSummary errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField
          control={control}
          name="registration_number"
          label="Registration number"
          required
        />
        <FormTextField control={control} name="chasis_number" label="Chassis number" required />
        <FormTextField
          control={control}
          name="max_seating_capacity"
          label="Seating capacity"
          type="number"
          required
        />
        <FormTextField control={control} name="vehicle_no" label="Vehicle number" optional />
        <FormTextField control={control} name="driver_name" label="Driver name" optional />
        <FormTextField control={control} name="driver_contact" label="Driver contact" optional />
        <FormTextField control={control} name="v_name" label="Tracking name" optional />
        <FormTextField control={control} name="v_color" label="Vehicle color" optional />
        <FormTextField control={control} name="v_group" label="Vehicle group" optional />
        <FormTextField control={control} name="v_api_url" label="Tracking API URL" optional />
      </div>
    </EntityFormDialog>
  );
}
