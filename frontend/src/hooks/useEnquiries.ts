import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { enquiryService } from '@services/api/enquiry.service';
import type { CreateEnquiryPayload, UpdateEnquiryPayload } from '@app-types/front-office/enquiry';
import { getApiErrorMessage } from '@utils/session';

export function useEnquiries() {
  return useQuery({
    queryKey: queryKeys.frontOffice.enquiries.list(),
    queryFn: enquiryService.list,
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEnquiryPayload) => enquiryService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Enquiry created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create enquiry')),
  });
}

export function useUpdateEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEnquiryPayload }) =>
      enquiryService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Enquiry updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update enquiry')),
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => enquiryService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.frontOffice.all });
      toast.success('Enquiry deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete enquiry')),
  });
}
