import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { promoteService } from '@services/api/promote.service';
import type { PromoteExecutePayload, PromotePreviewParams } from '@app-types/academics/promote';
import { getApiErrorMessage } from '@utils/session';

export function usePromotePreview(params: PromotePreviewParams | null) {
  return useQuery({
    queryKey: params ? queryKeys.academics.promote.preview(params) : ['disabled'],
    queryFn: () => promoteService.preview(params!),
    enabled: params !== null,
  });
}

export function useExecutePromote() {
  return useMutation({
    mutationFn: (payload: PromoteExecutePayload) => promoteService.execute(payload),
    onSuccess: (result) => {
      toast.success(
        `Promoted ${result.promoted_count} student(s)` +
          (result.skipped_count ? `, skipped ${result.skipped_count}` : ''),
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to promote students')),
  });
}
