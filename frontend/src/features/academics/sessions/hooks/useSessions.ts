import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { REFERENCE_DATA_STALE_TIME } from '@constants/query-stale-times';
import { sessionsService } from '@services/api';
import type {
  CreateSessionPayload,
  UpdateSessionPayload,
} from '@features/academics/sessions/types/session.types';
import { getApiErrorMessage } from '@utils/session';

export function useSessions(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.academics.sessions.list(page),
    queryFn: () => sessionsService.list(page),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useActiveSession() {
  return useQuery({
    queryKey: queryKeys.academics.sessions.active(),
    queryFn: sessionsService.getActive,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => sessionsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.sessions.all });
      toast.success('Academic session created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create session')),
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSessionPayload }) =>
      sessionsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.sessions.all });
      toast.success('Academic session updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update session')),
  });
}

export function useActivateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sessionsService.activate(id),
    onSuccess: (session) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.sessions.all });
      toast.success(`Active session switched to ${session.session}`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to activate session')),
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sessionsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.academics.sessions.all });
      toast.success('Academic session deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete session')),
  });
}
