import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { dashboardService } from '@services/api/dashboard.service';
import { useActiveSession } from '@hooks/useSessions';

export function useDashboardOverview() {
  const { data: activeSession } = useActiveSession();

  return useQuery({
    queryKey: [...queryKeys.dashboard.overview(), activeSession?.id ?? null],
    queryFn: () => dashboardService.getOverview(activeSession?.id),
    staleTime: 60_000,
  });
}
