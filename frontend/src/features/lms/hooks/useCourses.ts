import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/index';
import { lmsService } from '@services/api';
import type { CreateCoursePayload, UpdateCoursePayload } from '@app-types/lms';
import { getApiErrorMessage } from '@utils/session';

export const lmsKeys = {
  all: ['lms'] as const,
  courses: {
    all: () => [...lmsKeys.all, 'courses'] as const,
    list: (page: number, pageSize: number) =>
      [...lmsKeys.courses.all(), { page, pageSize }] as const,
    detail: (id: number) => [...lmsKeys.courses.all(), id] as const,
  },
};

export function useCourses(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: lmsKeys.courses.list(page, pageSize),
    queryFn: () => lmsService.list(page, pageSize),
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: lmsKeys.courses.detail(id),
    queryFn: () => lmsService.getById(id),
    enabled: id > 0,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => lmsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lmsKeys.courses.all() });
      toast.success('Course created successfully');
      navigate(ROUTES.lms.courses.root);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create course')),
  });
}

export function useUpdateCourse(id: number) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: UpdateCoursePayload) => lmsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lmsKeys.courses.all() });
      toast.success('Course updated successfully');
      navigate(ROUTES.lms.courses.root);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update course')),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => lmsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lmsKeys.courses.all() });
      toast.success('Course deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete course')),
  });
}
