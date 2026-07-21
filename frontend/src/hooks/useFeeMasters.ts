import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { feeMastersService, type CreateFeeMasterPayload, type UpdateFeeMasterPayload } from '@services/api/fee-masters.service';
import { getApiErrorMessage } from '@utils/session';

export function useFeeMasters() {
  return useQuery({
    queryKey: [...queryKeys.fees.all, 'masters'],
    queryFn: feeMastersService.list,
  });
}

export function useCreateFeeMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeeMasterPayload) => feeMastersService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee master rule created successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create fee master rule')),
  });
}

export function useUpdateFeeMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFeeMasterPayload }) =>
      feeMastersService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee master rule updated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update fee master rule')),
  });
}

export function useDeleteFeeMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeMastersService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fees.all });
      toast.success('Fee master rule deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete fee master rule')),
  });
}
