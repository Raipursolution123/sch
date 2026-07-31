import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { syllabusService } from '@services/api';
import type { CreateSubjectSyllabusPayload, UpdateSubjectSyllabusPayload } from '@app-types/academics/syllabus';
import { getApiErrorMessage } from '@utils/session';

export const SYLLABUS_KEYS = {
  all: ['syllabus'] as const,
  lists: () => [...SYLLABUS_KEYS.all, 'list'] as const,
};

export const useSyllabusList = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [...SYLLABUS_KEYS.lists(), params],
    queryFn: () => syllabusService.getSyllabusList(params),
  });
};

export const useCreateSyllabus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubjectSyllabusPayload) => syllabusService.createSyllabus(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SYLLABUS_KEYS.lists() });
      toast.success('Syllabus log created successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create syllabus log')),
  });
};

export const useUpdateSyllabus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSubjectSyllabusPayload }) =>
      syllabusService.updateSyllabus(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SYLLABUS_KEYS.lists() });
      toast.success('Syllabus log updated successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update syllabus log')),
  });
};

export const useDeleteSyllabus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => syllabusService.deleteSyllabus(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SYLLABUS_KEYS.lists() });
      toast.success('Syllabus log deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete syllabus log')),
  });
};
