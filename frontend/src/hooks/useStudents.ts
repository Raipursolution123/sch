import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '@constants/query-keys';
import { ROUTES } from '@constants/index';
import { studentsService } from '@services/api';
import type { CreateStudentPayload, UpdateStudentPayload } from '@app-types/students/student';
import type { DisableStudentPayload } from '@app-types/students/disable-reason';
import { getApiErrorMessage } from '@utils/session';

export function useStudents() {
  return useQuery({
    queryKey: queryKeys.students.list('active'),
    queryFn: () => studentsService.list('active'),
  });
}

export function useDisabledStudents() {
  return useQuery({
    queryKey: queryKeys.students.list('disabled'),
    queryFn: () => studentsService.list('disabled'),
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => studentsService.getById(id),
    enabled: id > 0,
  });
}

export function useSuggestedAdmissionNo(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.students.suggestAdmissionNo(),
    queryFn: studentsService.suggestAdmissionNo,
    enabled,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateStudentPayload) => studentsService.create(payload),
    onSuccess: (student) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success(`${student.full_name} admitted successfully`);
      navigate(ROUTES.students.detail(student.id));
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to admit student')),
  });
}

export function useUpdateStudent(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStudentPayload) => studentsService.update(id, payload),
    onSuccess: (student) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success(`${student.full_name} updated successfully`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update student')),
  });
}

export function useDisableReasons(enabled = true) {
  return useQuery({
    queryKey: queryKeys.students.disableReasons(),
    queryFn: studentsService.listDisableReasons,
    enabled,
  });
}

export function useDisableStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DisableStudentPayload }) =>
      studentsService.disable(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Student disabled successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to disable student')),
  });
}

export function useEnableStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentsService.enable(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Student re-enabled successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to re-enable student')),
  });
}
