import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { markDivisionsService } from '@services/api';
import type {
  CreateMarkDivisionPayload,
  UpdateMarkDivisionPayload,
} from '@app-types/examinations/mark-division';
import { getApiErrorMessage } from '@utils/session';

export function useMarkDivisions() {
  return useQuery({
    queryKey: queryKeys.examinations.divisions.list(),
    queryFn: markDivisionsService.list,
  });
}

export function useCreateMarkDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMarkDivisionPayload) => markDivisionsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Mark division created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create mark division')),
  });
}

export function useUpdateMarkDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMarkDivisionPayload }) =>
      markDivisionsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Mark division updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update mark division')),
  });
}

export function useDeleteMarkDivision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markDivisionsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      toast.success('Mark division deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete mark division')),
  });
}
