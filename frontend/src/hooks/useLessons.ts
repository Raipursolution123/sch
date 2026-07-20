import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { lessonService } from '@services/api';
import type { LessonCreatePayload, LessonUpdatePayload } from '@app-types/academics/lesson';
import { getApiErrorMessage } from '@utils/session';

export const LESSON_KEYS = {
  all: ['lessons'] as const,
  lists: () => [...LESSON_KEYS.all, 'list'] as const,
  details: () => [...LESSON_KEYS.all, 'detail'] as const,
};

export const useLessonList = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [...LESSON_KEYS.lists(), params],
    queryFn: () => lessonService.getLessonList(params),
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LessonCreatePayload) => lessonService.createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSON_KEYS.lists() });
      toast.success('Lesson created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create lesson')),
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LessonUpdatePayload }) =>
      lessonService.updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSON_KEYS.lists() });
      toast.success('Lesson updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update lesson')),
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => lessonService.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSON_KEYS.lists() });
      toast.success('Lesson deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete lesson')),
  });
};
