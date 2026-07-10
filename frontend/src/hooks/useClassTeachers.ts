import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { classTeachersService } from '@services/api/class-teachers.service';
import type {
  AssignClassTeacherPayload,
  UpdateClassTeacherPayload,
} from '@app-types/academics/class-teacher';
import { getApiErrorMessage } from '@utils/session';

export function useClassTeachers(
  sessionId?: number,
  classId?: number,
  sectionId?: number,
) {
  return useQuery({
    queryKey: queryKeys.academics.classTeachers.list(sessionId, classId, sectionId),
    queryFn: () => classTeachersService.list(sessionId!, classId, sectionId),
    enabled: sessionId !== undefined,
  });
}

export function useAssignClassTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignClassTeacherPayload) =>
      classTeachersService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.academics.classTeachers.all,
      });
      toast.success('Class teacher assigned');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to assign class teacher')),
  });
}

export function useUpdateClassTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateClassTeacherPayload }) =>
      classTeachersService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.academics.classTeachers.all,
      });
      toast.success('Class teacher updated');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to update class teacher')),
  });
}

export function useRemoveClassTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classTeachersService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.academics.classTeachers.all,
      });
      toast.success('Class teacher removed');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to remove class teacher')),
  });
}
