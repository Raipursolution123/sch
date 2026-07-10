import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { subjectGroupsService } from '@services/api/subject-groups.service';
import type {
  CreateSubjectGroupPayload,
  SyncSubjectGroupClassSectionsPayload,
  SyncSubjectGroupSubjectsPayload,
  UpdateSubjectGroupPayload,
} from '@app-types/academics/subject-group';
import { getApiErrorMessage } from '@utils/session';

export function useSubjectGroups(sessionId?: number, page = 1) {
  return useQuery({
    queryKey: [...queryKeys.academics.subjectGroups.list(sessionId), page],
    queryFn: () => subjectGroupsService.list(sessionId, page),
    enabled: sessionId !== undefined,
  });
}

export function useSubjectGroup(id: number | null, enabled = false) {
  return useQuery({
    queryKey: id ? queryKeys.academics.subjectGroups.detail(id) : ['disabled'],
    queryFn: () => subjectGroupsService.get(id!),
    enabled: enabled && id !== null,
  });
}

export function useCreateSubjectGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubjectGroupPayload) => subjectGroupsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.subjectGroups.all });
      toast.success('Subject group created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create subject group')),
  });
}

export function useUpdateSubjectGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSubjectGroupPayload }) =>
      subjectGroupsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.subjectGroups.all });
      toast.success('Subject group updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update subject group')),
  });
}

export function useDeleteSubjectGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subjectGroupsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.subjectGroups.all });
      toast.success('Subject group deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete subject group')),
  });
}

export function useSyncSubjectGroupSubjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: SyncSubjectGroupSubjectsPayload;
    }) => subjectGroupsService.syncSubjects(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.subjectGroups.all });
      toast.success('Subjects assigned');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to assign subjects')),
  });
}

export function useSyncSubjectGroupClassSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: SyncSubjectGroupClassSectionsPayload;
    }) => subjectGroupsService.syncClassSections(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.subjectGroups.all });
      toast.success('Class sections assigned');
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Failed to assign class sections')),
  });
}
