import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { staffRatingsService } from '@services/api/staff-ratings.service';
import { getApiErrorMessage } from '@utils/session';

export function useStaffRatings(status?: number | '') {
  return useQuery({
    queryKey: queryKeys.staff.ratings.list(status),
    queryFn: () =>
      staffRatingsService.list(status === '' || status === undefined ? undefined : status),
  });
}

export function useApproveStaffRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffRatingsService.approve(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Rating approved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to approve rating')),
  });
}

export function useDeclineStaffRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffRatingsService.decline(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Rating declined');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to decline rating')),
  });
}

export function useDeleteStaffRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffRatingsService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success('Rating deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete rating')),
  });
}
