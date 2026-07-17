import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { roomTypesService } from '@services/api';
import type { CreateRoomTypePayload, UpdateRoomTypePayload } from '@app-types/hostel/room-type';
import { getApiErrorMessage } from '@utils/session';

export function useRoomTypes() {
  return useQuery({
    queryKey: queryKeys.hostel.roomTypes.list(),
    queryFn: roomTypesService.list,
  });
}

export function useCreateRoomType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoomTypePayload) => roomTypesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hostel.all });
      toast.success('Room type created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create room type')),
  });
}

export function useUpdateRoomType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRoomTypePayload }) =>
      roomTypesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hostel.all });
      toast.success('Room type updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update room type')),
  });
}

export function useDeleteRoomType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roomTypesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hostel.all });
      toast.success('Room type deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete room type')),
  });
}
