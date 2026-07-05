import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { sessionsService } from '@services/api';
import type { CreateSessionPayload, UpdateSessionPayload } from '@app-types/settings/session';
import { getApiErrorMessage } from '@utils/session';

export function useSessions(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.settings.sessions.list(page),
    queryFn: () => sessionsService.list(page),
  });
}

export function useActiveSession() {
  return useQuery({
    queryKey: queryKeys.settings.sessions.active(),
    queryFn: sessionsService.getActive,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => sessionsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.sessions.all });
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.sessions.all });
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.sessions.all });
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.sessions.all });
      toast.success('Academic session deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete session')),
  });
}
