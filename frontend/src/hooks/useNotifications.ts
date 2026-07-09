import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { notificationsService } from '@services/api/notifications.service';
import { useActiveSession } from '@hooks/useSessions';

export function useNotifications() {
  const { data: activeSession } = useActiveSession();

  return useQuery({
    queryKey: queryKeys.notifications.list(activeSession?.id ?? null),
    queryFn: () => notificationsService.list(activeSession?.id),
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { data: activeSession } = useActiveSession();

  return useMutation({
    mutationFn: async (id: string) => {
      notificationsService.markRead(id);
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(activeSession?.id ?? null),
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { data: activeSession } = useActiveSession();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      notificationsService.markAllRead(ids);
      return ids;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(activeSession?.id ?? null),
      });
    },
  });
}
