import { useTrialBalanceReport } from '@hooks/useFinanceReports';
import type { DateRangeFilters } from '@app-types/finance';

export const TRIAL_BALANCE_KEYS = {
  all: ['finance', 'reports', 'trial-balance'] as const,
  detail: (from = '', to = '') => [...TRIAL_BALANCE_KEYS.all, 'detail', from, to] as const,
};

export function useTrialBalance(filters: DateRangeFilters = {}, enabled = true) {
  return useTrialBalanceReport(filters, enabled);
}
