import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { routesService } from '@services/api';
import type {
  CreateTransportRoutePayload,
  UpdateTransportRoutePayload,
} from '@app-types/transport';
import { getApiErrorMessage } from '@utils/session';

export function useTransportRoutes() {
  return useQuery({
    queryKey: queryKeys.transport.routes(),
    queryFn: routesService.list,
  });
}

export function useCreateTransportRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransportRoutePayload) => routesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Transport route created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create route')),
  });
}

export function useUpdateTransportRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTransportRoutePayload }) =>
      routesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Transport route updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update route')),
  });
}

export function useDeleteTransportRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: routesService.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transport.all });
      toast.success('Transport route deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete route')),
  });
}
