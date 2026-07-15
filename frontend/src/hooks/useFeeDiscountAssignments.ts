import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { feeDiscountAssignmentsService } from '@services/api';
import type { AssignFeeDiscountPayload } from '@app-types/fees/fee-discount-assignment';
import { getApiErrorMessage } from '@utils/session';

export function useFeeDiscountAssignRoster(
  classId: number,
  sectionId: number,
  feesDiscountId: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.fees.discountAssignments.roster(classId, sectionId, feesDiscountId),
    queryFn: () => feeDiscountAssignmentsService.getRoster(classId, sectionId, feesDiscountId),
    enabled: enabled && classId > 0 && sectionId > 0 && feesDiscountId > 0,
  });
}

export function useAssignFeeDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignFeeDiscountPayload) =>
      feeDiscountAssignmentsService.assign(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.fees.discountAssignments.all(),
      });
      toast.success(
        result.assigned_count > 0
          ? `Assigned to ${result.assigned_count} student${result.assigned_count === 1 ? '' : 's'}`
          : 'No new assignments (already assigned)',
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to assign fee discount')),
  });
}

export function useUnassignFeeDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => feeDiscountAssignmentsService.unassign(assignmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.fees.discountAssignments.all(),
      });
      toast.success('Discount assignment removed');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to remove discount assignment')),
  });
}
