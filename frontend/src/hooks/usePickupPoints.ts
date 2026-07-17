import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { pickupPointsService } from '@services/api';
import type { CreatePickupPointPayload, UpdatePickupPointPayload } from '@app-types/transport';
import { getApiErrorMessage } from '@utils/session';

export function usePickupPoints() {
  return useQuery({
    queryKey: queryKeys.transport.pickupPoints(),
    queryFn: pickupPointsService.list,
  });
}

export function useCreatePickupPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePickupPointPayload) => pickupPointsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Pickup point created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create pickup point')),
  });
}

export function useUpdatePickupPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePickupPointPayload }) =>
      pickupPointsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Pickup point updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update pickup point')),
  });
}

export function useDeletePickupPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pickupPointsService.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Pickup point deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete pickup point')),
  });
}
