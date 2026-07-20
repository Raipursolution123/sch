import { useQuery } from '@tanstack/react-query';
import { financeReportsService } from '@services/api';

export const TRIAL_BALANCE_KEYS = {
  all: ['finance', 'reports', 'trial-balance'] as const,
  detail: () => [...TRIAL_BALANCE_KEYS.all, 'detail'] as const,
};

export function useTrialBalance(enabled = true) {
  return useQuery({
    queryKey: TRIAL_BALANCE_KEYS.detail(),
    queryFn: financeReportsService.getTrialBalance,
    enabled,
  });
}
