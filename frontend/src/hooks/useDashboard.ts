import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { dashboardService } from '@services/api/dashboard.service';

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: dashboardService.getOverview,
    staleTime: 60_000,
  });
}
