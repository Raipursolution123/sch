import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SettingsCard } from '@components/forms/SettingsCard';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField } from '@components/forms/fields';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useStudentTransport, useUpdateStudentTransport } from '@hooks/useStudentTransport';
import { useVehicleRoutes } from '@hooks/useVehicleRoutes';
import type { StudentDetail } from '@app-types/students/student';

const schema = z.object({
  vehroute_id: z.string().min(1, 'Vehicle route is required'),
  route_pickup_point_id: z.string().min(1, 'Pickup point is required'),
  transport_fees: z
    .string()
    .min(1, 'Transport fee is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: 'Enter a valid fee',
    }),
});

type FormValues = z.infer<typeof schema>;

export function StudentTransportTab({ student }: { student: StudentDetail }) {
  const { data, isLoading, isError, error, refetch } = useStudentTransport(student.id);
  const { data: assignments = [] } = useVehicleRoutes();
  const updateMutation = useUpdateStudentTransport(student.id);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vehroute_id: '', route_pickup_point_id: '', transport_fees: '0' },
  });
  const selectedAssignmentId = useWatch({ control, name: 'vehroute_id' });
  const selectedPickupId = useWatch({ control, name: 'route_pickup_point_id' });
  const selectedAssignment = assignments.find(
    (assignment) => assignment.id === Number(selectedAssignmentId),
  );
  const pickupPoints = useMemo(
    () =>
      (data?.pickup_points ?? []).filter(
        (point) => point.route_id === selectedAssignment?.route_id,
      ),
    [data?.pickup_points, selectedAssignment?.route_id],
  );

  useEffect(() => {
    if (!data) return;
    reset({
      vehroute_id: data.vehroute_id ? String(data.vehroute_id) : '',
      route_pickup_point_id: data.route_pickup_point_id ? String(data.route_pickup_point_id) : '',
      transport_fees: String(data.transport_fees ?? 0),
    });
  }, [data, reset]);

  useEffect(() => {
    if (selectedPickupId && !pickupPoints.some((point) => point.id === Number(selectedPickupId))) {
      setValue('route_pickup_point_id', '');
    }
  }, [pickupPoints, selectedPickupId, setValue]);

  if (isLoading) return <LoadingState message="Loading transport assignment..." />;
  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load transport assignment'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Route</p>
          <p className="mt-1 font-semibold">{data.route_title ?? 'Not assigned'}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Vehicle
          </p>
          <p className="mt-1 font-semibold">
            {data.vehicle_no ?? data.registration_number ?? 'Not assigned'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pickup point
          </p>
          <p className="mt-1 font-semibold">{data.pickup_point_name ?? 'Not assigned'}</p>
        </div>
      </div>

      <SettingsCard title="Edit transport assignment">
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) =>
            updateMutation.mutate({
              vehroute_id: Number(values.vehroute_id),
              route_pickup_point_id: Number(values.route_pickup_point_id),
              transport_fees: Number(values.transport_fees),
            }),
          )}
        >
          <FormErrorSummary errors={errors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelectField
              control={control}
              name="vehroute_id"
              label="Vehicle route"
              options={assignments.map((assignment) => ({
                value: String(assignment.id),
                label: `${assignment.route_title ?? `Route ${assignment.route_id}`} — ${
                  assignment.vehicle_no ?? `Vehicle ${assignment.vehicle_id}`
                }`,
              }))}
              required
            />
            <FormSelectField
              control={control}
              name="route_pickup_point_id"
              label="Pickup point"
              options={pickupPoints.map((point) => ({
                value: String(point.id),
                label: point.name,
              }))}
              disabled={!selectedAssignment}
              required
            />
            <FormTextField
              control={control}
              name="transport_fees"
              label="Transport fee"
              type="number"
              required
            />
          </div>
          <PermissionButton
            type="submit"
            permission="transport.edit"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save transport assignment'}
          </PermissionButton>
        </form>
      </SettingsCard>
    </div>
  );
}
