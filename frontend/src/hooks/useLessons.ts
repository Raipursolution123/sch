import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '@/services/api/lesson.service';
import type { LessonCreatePayload, LessonUpdatePayload } from '@/types/academics/lesson';

export const LESSON_KEYS = {
  all: ['lessons'] as const,
  lists: () => [...LESSON_KEYS.all, 'list'] as const,
  details: () => [...LESSON_KEYS.all, 'detail'] as const,
};

export const useLessonList = (params?: Record<string, any>) => {
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
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LessonUpdatePayload }) =>
      lessonService.updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSON_KEYS.lists() });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => lessonService.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSON_KEYS.lists() });
    },
  });
};
