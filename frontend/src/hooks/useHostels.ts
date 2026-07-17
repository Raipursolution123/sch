import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { hostelService } from '@services/api';
import type { CreateHostelPayload, UpdateHostelPayload } from '@app-types/hostel/hostel';
import { getApiErrorMessage } from '@utils/session';

export function useHostels() {
  return useQuery({
    queryKey: queryKeys.hostel.hostels.list(),
    queryFn: hostelService.list,
  });
}

export function useCreateHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHostelPayload) => hostelService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hostel.all });
      toast.success('Hostel created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create hostel')),
  });
}

export function useUpdateHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateHostelPayload }) =>
      hostelService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hostel.all });
      toast.success('Hostel updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update hostel')),
  });
}

export function useDeleteHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hostelService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hostel.all });
      toast.success('Hostel deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete hostel')),
  });
}
