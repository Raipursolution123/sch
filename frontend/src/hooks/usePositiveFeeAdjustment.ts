import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { positiveFeeAdjustmentService } from '@services/api/positive-fee-adjustment.service';
import { getApiErrorMessage } from '@utils/session';

export function usePositiveFeeAdjustments() {
  return useQuery({
    queryKey: ['fees', 'positive-adjustments'],
    queryFn: positiveFeeAdjustmentService.list,
  });
}

export function usePositiveFeeAdjustmentRoster(
  classId?: number,
  sectionId?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ['fees', 'positive-adjustments', 'roster', classId ?? 0, sectionId ?? 0],
    queryFn: () => positiveFeeAdjustmentService.getRoster(classId, sectionId),
    enabled,
  });
}

export function useApplyPositiveFeeAdjustments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: positiveFeeAdjustmentService.applyBulk,
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['fees'] });
      toast.success(`Applied ${data.applied_count} fee adjustment(s)`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to apply adjustments')),
  });
}
