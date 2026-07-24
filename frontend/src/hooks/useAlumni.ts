import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { alumniService } from '@services/api';
import type {
  AlumniEventCreatePayload,
  AlumniEventUpdatePayload,
  AlumniStudentCreatePayload,
  AlumniStudentUpdatePayload,
} from '@app-types/alumni';
import { getApiErrorMessage } from '@utils/session';

function invalidateStudents(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.alumni.all });
}

export function useAlumniStudents(query = '') {
  return useQuery({
    queryKey: queryKeys.alumni.students.list(query),
    queryFn: () => alumniService.listStudents(query || undefined),
  });
}

export function useCreateAlumniStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AlumniStudentCreatePayload) => alumniService.createStudent(payload),
    onSuccess: () => {
      invalidateStudents(qc);
      toast.success('Alumni record created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create alumni')),
  });
}

export function useUpdateAlumniStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AlumniStudentUpdatePayload }) =>
      alumniService.updateStudent(id, payload),
    onSuccess: () => {
      invalidateStudents(qc);
      toast.success('Alumni record updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update alumni')),
  });
}

export function useDeleteAlumniStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alumniService.deleteStudent(id),
    onSuccess: () => {
      invalidateStudents(qc);
      toast.success('Alumni record deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete alumni')),
  });
}

export function useAlumniEvents(query = '') {
  return useQuery({
    queryKey: queryKeys.alumni.events.list(query),
    queryFn: () => alumniService.listEvents(query || undefined),
  });
}

export function useCreateAlumniEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AlumniEventCreatePayload) => alumniService.createEvent(payload),
    onSuccess: () => {
      invalidateStudents(qc);
      toast.success('Alumni event created');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to create alumni event')),
  });
}

export function useUpdateAlumniEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AlumniEventUpdatePayload }) =>
      alumniService.updateEvent(id, payload),
    onSuccess: () => {
      invalidateStudents(qc);
      toast.success('Alumni event updated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to update alumni event')),
  });
}

export function useDeleteAlumniEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alumniService.deleteEvent(id),
    onSuccess: () => {
      invalidateStudents(qc);
      toast.success('Alumni event deleted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Failed to delete alumni event')),
  });
}

export function useAlumniReport(query = '', enabled = true) {
  return useQuery({
    queryKey: queryKeys.alumni.report.list(query),
    queryFn: () => alumniService.getReport(query || undefined),
    enabled,
  });
}
