import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { onlineAdmissionsService } from '@services/api/online-admissions.service';
import type {
  ConvertOnlineAdmissionPayload,
  CreateOnlineAdmissionPayload,
  UpdateOnlineAdmissionPayload,
} from '@app-types/admissions/online-admission';
import { getApiErrorMessage } from '@utils/session';

export function useOnlineAdmissions() {
  return useQuery({
    queryKey: queryKeys.admissions.online.list(),
    queryFn: onlineAdmissionsService.list,
  });
}

export function useCreateOnlineAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOnlineAdmissionPayload) => onlineAdmissionsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admissions.all });
      toast.success('Online admission created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create online admission')),
  });
}

export function useUpdateOnlineAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateOnlineAdmissionPayload }) =>
      onlineAdmissionsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admissions.all });
      toast.success('Online admission updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update online admission')),
  });
}

export function useConvertOnlineAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: ConvertOnlineAdmissionPayload }) =>
      onlineAdmissionsService.convert(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admissions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Online admission converted to student');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to convert online admission')),
  });
}
