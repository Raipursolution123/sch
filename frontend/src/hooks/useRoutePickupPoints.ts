import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { routePickupPointsService } from '@services/api/route-pickup-points.service';
import type {
  CreateRoutePickupPointPayload,
  UpdateRoutePickupPointPayload,
} from '@app-types/transport';
import { getApiErrorMessage } from '@utils/session';

export function useRoutePickupPoints(routeId?: number) {
  return useQuery({
    queryKey: queryKeys.transport.routePickupPoints(routeId),
    queryFn: () => routePickupPointsService.list(routeId),
  });
}

export function useCreateRoutePickupPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoutePickupPointPayload) =>
      routePickupPointsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Route pickup point assigned');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to assign pickup point to route')),
  });
}

export function useUpdateRoutePickupPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRoutePickupPointPayload }) =>
      routePickupPointsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Route pickup point updated');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to update route pickup point')),
  });
}

export function useDeleteRoutePickupPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => routePickupPointsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Route pickup point removed');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to remove route pickup point')),
  });
}
