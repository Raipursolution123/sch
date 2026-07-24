import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { complaintsService } from '@services/api/complaints.service';
import type {
  CreateComplaintPayload,
  UpdateComplaintPayload,
} from '@app-types/front-office/complaint';
import { getApiErrorMessage } from '@utils/session';

export function useComplaints() {
  return useQuery({
    queryKey: queryKeys.frontOffice.complaints.list(),
    queryFn: complaintsService.list,
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateComplaintPayload) => complaintsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Complaint created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create complaint')),
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateComplaintPayload }) =>
      complaintsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Complaint updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update complaint')),
  });
}

export function useDeleteComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => complaintsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Complaint deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete complaint')),
  });
}
