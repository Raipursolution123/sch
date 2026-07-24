import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { postalService } from '@services/api/postal.service';
import type {
  CreatePostalRecordPayload,
  PostalRecordType,
  UpdatePostalRecordPayload,
} from '@app-types/front-office/postal';
import { getApiErrorMessage } from '@utils/session';

export function usePostalRecords(type?: PostalRecordType) {
  return useQuery({
    queryKey: queryKeys.frontOffice.postal.list(type),
    queryFn: postalService.list,
    select: (records) => (type ? records.filter((record) => record.type === type) : records),
  });
}

export function useCreatePostalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostalRecordPayload) => postalService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Postal record created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create postal record')),
  });
}

export function useUpdatePostalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePostalRecordPayload }) =>
      postalService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Postal record updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update postal record')),
  });
}

export function useDeletePostalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postalService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Postal record deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete postal record')),
  });
}
