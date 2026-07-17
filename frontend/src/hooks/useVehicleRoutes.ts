import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { vehicleRoutesService } from '@services/api';
import type {
  CreateVehicleRouteAssignmentPayload,
  UpdateVehicleRouteAssignmentPayload,
} from '@app-types/transport';
import { getApiErrorMessage } from '@utils/session';

export function useVehicleRoutes() {
  return useQuery({
    queryKey: queryKeys.transport.vehicleRoutes(),
    queryFn: vehicleRoutesService.list,
  });
}

export function useCreateVehicleRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehicleRouteAssignmentPayload) =>
      vehicleRoutesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Vehicle assigned to route');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to assign vehicle')),
  });
}

export function useUpdateVehicleRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVehicleRouteAssignmentPayload }) =>
      vehicleRoutesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Vehicle assignment updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update assignment')),
  });
}

export function useDeleteVehicleRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehicleRoutesService.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Vehicle assignment removed');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to remove assignment')),
  });
}
