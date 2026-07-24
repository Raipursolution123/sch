import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { syllabusStatusService } from '@services/api';
import type {
  SyllabusStatusUpdatePayload,
  SyllabusStatusCreatePayload,
} from '@app-types/academics/syllabus-status';
import { getApiErrorMessage } from '@utils/session';

export const SYLLABUS_STATUS_KEYS = {
  all: ['syllabus-status'] as const,
  lists: () => [...SYLLABUS_STATUS_KEYS.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...SYLLABUS_STATUS_KEYS.lists(), params] as const,
};

export const useSyllabusStatusList = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: SYLLABUS_STATUS_KEYS.list(params || {}),
    queryFn: () => syllabusStatusService.getSyllabusStatusList(params),
  });
};

export const useUpdateSyllabusStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SyllabusStatusUpdatePayload }) =>
      syllabusStatusService.updateSyllabusStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYLLABUS_STATUS_KEYS.lists() });
      toast.success('Syllabus status updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update syllabus status')),
  });
};

export const useCreateSyllabusStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SyllabusStatusCreatePayload) =>
      syllabusStatusService.createSyllabusStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYLLABUS_STATUS_KEYS.lists() });
      toast.success('Syllabus status created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create syllabus status')),
  });
};

export const useDeleteSyllabusStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => syllabusStatusService.deleteSyllabusStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYLLABUS_STATUS_KEYS.lists() });
      toast.success('Syllabus status deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete syllabus status')),
  });
};
