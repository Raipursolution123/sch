import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { staffLeaveAllotmentsService } from '@services/api';
import type { SaveStaffLeaveAllotmentsPayload } from '@app-types/staff/leave-allotment';
import { getApiErrorMessage } from '@utils/session';

export function useStaffLeaveAllotmentRoster(staffId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.staff.leaveAllotments.roster(staffId),
    queryFn: () => staffLeaveAllotmentsService.getRoster(staffId),
    enabled: enabled && staffId > 0,
  });
}

export function useSaveStaffLeaveAllotments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveStaffLeaveAllotmentsPayload) =>
      staffLeaveAllotmentsService.saveRoster(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.staff.leaveAllotments.roster(variables.staff_id),
      });
      toast.success('Leave allotments saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save leave allotments')),
  });
}
