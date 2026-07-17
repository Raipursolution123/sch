import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { vehiclesService } from '@services/api';
import type { CreateVehiclePayload, UpdateVehiclePayload } from '@app-types/transport';
import { getApiErrorMessage } from '@utils/session';

export function useVehicles() {
  return useQuery({
    queryKey: queryKeys.transport.vehicles(),
    queryFn: vehiclesService.list,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => vehiclesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Vehicle created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create vehicle')),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVehiclePayload }) =>
      vehiclesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Vehicle updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update vehicle')),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehiclesService.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Vehicle deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete vehicle')),
  });
}
