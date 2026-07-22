import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { idCardsService } from '@services/api/id-cards.service';
import type {
  CreateStaffIdCardPayload,
  CreateStudentIdCardPayload,
  UpdateStaffIdCardPayload,
  UpdateStudentIdCardPayload,
} from '@app-types/id-cards';
import { getApiErrorMessage } from '@utils/session';

export function useStudentIdCardTemplates(query = '') {
  return useQuery({
    queryKey: queryKeys.idCards.student.list(query),
    queryFn: () => idCardsService.listStudent(query || undefined),
  });
}

export function useCreateStudentIdCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentIdCardPayload) => idCardsService.createStudent(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.idCards.all });
      toast.success('Student ID template created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create template')),
  });
}

export function useUpdateStudentIdCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStudentIdCardPayload }) =>
      idCardsService.updateStudent(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.idCards.all });
      toast.success('Student ID template updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update template')),
  });
}

export function useDeleteStudentIdCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => idCardsService.deleteStudent(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.idCards.all });
      toast.success('Student ID template deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete template')),
  });
}

export function useGenerateStudentIdCard() {
  return useMutation({
    mutationFn: ({ templateId, personId }: { templateId: number; personId: number }) =>
      idCardsService.generateStudent(templateId, personId),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to generate ID card')),
  });
}

export function useStaffIdCardTemplates(query = '') {
  return useQuery({
    queryKey: queryKeys.idCards.staff.list(query),
    queryFn: () => idCardsService.listStaff(query || undefined),
  });
}

export function useCreateStaffIdCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffIdCardPayload) => idCardsService.createStaff(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.idCards.all });
      toast.success('Staff ID template created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create template')),
  });
}

export function useUpdateStaffIdCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffIdCardPayload }) =>
      idCardsService.updateStaff(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.idCards.all });
      toast.success('Staff ID template updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update template')),
  });
}

export function useDeleteStaffIdCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => idCardsService.deleteStaff(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.idCards.all });
      toast.success('Staff ID template deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete template')),
  });
}

export function useGenerateStaffIdCard() {
  return useMutation({
    mutationFn: ({ templateId, personId }: { templateId: number; personId: number }) =>
      idCardsService.generateStaff(templateId, personId),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to generate ID card')),
  });
}
