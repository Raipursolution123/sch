import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import {
  feeCarryForwardService,
  feeStudentAssignService,
} from '@services/api/fee-student-assign.service';
import type {
  CarryForwardFeesPayload,
  SaveFeeStudentAssignPayload,
} from '@app-types/fees/fee-student-assign';
import { getApiErrorMessage } from '@utils/session';

export function useFeeStudentAssignRoster(
  feeSessionGroupId: number,
  sectionId: number | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.fees.studentAssignments.roster(feeSessionGroupId, sectionId),
    queryFn: () => feeStudentAssignService.getRoster(feeSessionGroupId, sectionId),
    enabled: enabled && feeSessionGroupId > 0,
  });
}

export function useSaveFeeStudentAssignments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveFeeStudentAssignPayload) => feeStudentAssignService.save(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.fees.all, 'student-assignments'] });
      toast.success('Student fee assignments saved');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to save student fee assignments')),
  });
}

export function useFeeCarryForwardPreview(
  fromSessionId: number,
  toSessionId: number,
  classId: number,
  sectionId: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.fees.carryForward.preview(fromSessionId, toSessionId, classId, sectionId),
    queryFn: () => feeCarryForwardService.preview(fromSessionId, toSessionId, classId, sectionId),
    enabled: enabled && fromSessionId > 0 && toSessionId > 0 && classId > 0 && sectionId > 0,
  });
}

export function useCarryForwardFees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CarryForwardFeesPayload) => feeCarryForwardService.carryForward(payload),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: [...queryKeys.fees.all, 'carry-forward'] });
      toast.success(
        data.carried_count
          ? `Carried forward for ${data.carried_count} student(s)`
          : 'Carry forward completed',
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to carry forward fees')),
  });
}
