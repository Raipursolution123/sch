import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { financeReportsService } from '@services/api';
import type { DateRangeFilters, ReconciliationUpdatePayload } from '@app-types/finance';
import { getApiErrorMessage } from '@utils/session';

export function useFinanceReportsIndex(enabled = true) {
  return useQuery({
    queryKey: queryKeys.finance.reports.index(),
    queryFn: financeReportsService.getIndex,
    enabled,
  });
}

export function useTrialBalanceReport(filters: DateRangeFilters = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.finance.reports.trialBalance(
      filters.from_date ?? '',
      filters.to_date ?? '',
    ),
    queryFn: () => financeReportsService.getTrialBalance(filters),
    enabled,
  });
}

export function useBalanceSheetReport(asOf?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.finance.reports.balanceSheet(asOf ?? ''),
    queryFn: () => financeReportsService.getBalanceSheet(asOf),
    enabled,
  });
}

export function useProfitLossReport(filters: DateRangeFilters = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.finance.reports.profitLoss(filters.from_date ?? '', filters.to_date ?? ''),
    queryFn: () => financeReportsService.getProfitLoss(filters),
    enabled,
  });
}

export function useLedgerStatementReport(
  params: { ledger_id: number; from_date?: string; to_date?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.finance.reports.ledgerStatement(
      params.ledger_id,
      params.from_date ?? '',
      params.to_date ?? '',
    ),
    queryFn: () => financeReportsService.getLedgerStatement(params),
    enabled: enabled && params.ledger_id > 0,
  });
}

export function useLedgerEntriesReport(
  params: { ledger_id?: number; from_date?: string; to_date?: string } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.finance.reports.ledgerEntries(
      params.ledger_id ?? 0,
      params.from_date ?? '',
      params.to_date ?? '',
    ),
    queryFn: () => financeReportsService.getLedgerEntries(params),
    enabled,
  });
}

export function useReconciliationReport(ledgerId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.finance.reports.reconciliation(ledgerId ?? 0),
    queryFn: () => financeReportsService.getReconciliation(ledgerId),
    enabled,
  });
}

export function useUpdateReconciliation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReconciliationUpdatePayload) =>
      financeReportsService.updateReconciliation(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Reconciliation updated');
      void queryClient.invalidateQueries({ queryKey: queryKeys.finance.reports.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update reconciliation')),
  });
}
