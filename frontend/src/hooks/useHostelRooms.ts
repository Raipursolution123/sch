import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { hostelRoomsService } from '@services/api';
import type {
  CreateHostelRoomPayload,
  UpdateHostelRoomPayload,
} from '@app-types/hostel/hostel-room';
import { getApiErrorMessage } from '@utils/session';

export function useHostelRooms(hostelId?: number) {
  return useQuery({
    queryKey: queryKeys.hostel.rooms.list(hostelId),
    queryFn: () => hostelRoomsService.list(hostelId),
  });
}

export function useCreateHostelRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHostelRoomPayload) => hostelRoomsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hostel.all });
      toast.success('Room created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create room')),
  });
}

export function useUpdateHostelRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateHostelRoomPayload }) =>
      hostelRoomsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hostel.all });
      toast.success('Room updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update room')),
  });
}

export function useDeleteHostelRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hostelRoomsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hostel.all });
      toast.success('Room deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete room')),
  });
}
