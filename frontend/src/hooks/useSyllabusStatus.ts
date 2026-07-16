import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syllabusStatusService } from '@/services/api/syllabus-status.service';
import type {
  SyllabusStatusUpdatePayload,
  SyllabusStatusCreatePayload,
} from '@/types/academics/syllabus-status';

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
    },
  });
};

export const useCreateSyllabusStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SyllabusStatusCreatePayload) =>
      syllabusStatusService.createSyllabusStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYLLABUS_STATUS_KEYS.lists() });
    },
  });
};

export const useDeleteSyllabusStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => syllabusStatusService.deleteSyllabusStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYLLABUS_STATUS_KEYS.lists() });
    },
  });
};
