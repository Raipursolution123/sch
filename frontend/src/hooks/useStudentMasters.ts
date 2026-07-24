import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { studentMastersService } from '@services/api/student-masters.service';
import type {
  CreateStudentCategoryPayload,
  CreateStudentHousePayload,
  StudentImportRow,
  UpdateStudentCategoryPayload,
  UpdateStudentHousePayload,
} from '@app-types/students/masters';
import { getApiErrorMessage } from '@utils/session';

export function useStudentCategories(query = '') {
  return useQuery({
    queryKey: queryKeys.students.categories.list(query),
    queryFn: () => studentMastersService.listCategories(query || undefined),
  });
}

export function useCreateStudentCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentCategoryPayload) =>
      studentMastersService.createCategory(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.categories.all });
      toast.success('Category created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create category')),
  });
}

export function useUpdateStudentCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStudentCategoryPayload }) =>
      studentMastersService.updateCategory(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.categories.all });
      toast.success('Category updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update category')),
  });
}

export function useDeleteStudentCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentMastersService.deleteCategory(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.categories.all });
      toast.success('Category deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete category')),
  });
}

export function useStudentHouses(query = '') {
  return useQuery({
    queryKey: queryKeys.students.houses.list(query),
    queryFn: () => studentMastersService.listHouses(query || undefined),
  });
}

export function useCreateStudentHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentHousePayload) => studentMastersService.createHouse(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.houses.all });
      toast.success('House created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create house')),
  });
}

export function useUpdateStudentHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStudentHousePayload }) =>
      studentMastersService.updateHouse(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.houses.all });
      toast.success('House updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update house')),
  });
}

export function useDeleteStudentHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentMastersService.deleteHouse(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.houses.all });
      toast.success('House deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete house')),
  });
}

export function useStudentImportTemplate(enabled = true) {
  return useQuery({
    queryKey: queryKeys.students.importTemplate(),
    queryFn: () => studentMastersService.importTemplate(),
    enabled,
  });
}

export function useImportStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: StudentImportRow[]) => studentMastersService.importRows(rows),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success(
        `Imported ${result.created_count} student(s)` +
          (result.error_count ? ` (${result.error_count} failed)` : ''),
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Import failed')),
  });
}
