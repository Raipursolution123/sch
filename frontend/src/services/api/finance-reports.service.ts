import { apiClient } from './client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  BalanceSheetReport,
  DateRangeFilters,
  FinanceReportsIndex,
  LedgerEntriesReport,
  LedgerStatementReport,
  ProfitLossReport,
  ReconciliationReport,
  ReconciliationUpdatePayload,
  TrialBalanceReport,
} from '@app-types/finance';

export const financeReportsService = {
  getIndex: async (): Promise<FinanceReportsIndex> => {
    const response = await apiClient.get<ApiSuccessResponse<FinanceReportsIndex>>(
      API_ENDPOINTS.finance.reports,
    );
    return response.data.data;
  },

  getTrialBalance: async (filters: DateRangeFilters = {}): Promise<TrialBalanceReport> => {
    const response = await apiClient.get<ApiSuccessResponse<TrialBalanceReport>>(
      API_ENDPOINTS.finance.trialBalance,
      { params: filters },
    );
    return response.data.data;
  },

  getBalanceSheet: async (asOf?: string): Promise<BalanceSheetReport> => {
    const response = await apiClient.get<ApiSuccessResponse<BalanceSheetReport>>(
      API_ENDPOINTS.finance.balanceSheet,
      { params: asOf ? { as_of: asOf } : undefined },
    );
    return response.data.data;
  },

  getProfitLoss: async (filters: DateRangeFilters = {}): Promise<ProfitLossReport> => {
    const response = await apiClient.get<ApiSuccessResponse<ProfitLossReport>>(
      API_ENDPOINTS.finance.profitLoss,
      { params: filters },
    );
    return response.data.data;
  },

  getLedgerStatement: async (params: {
    ledger_id: number;
    from_date?: string;
    to_date?: string;
  }): Promise<LedgerStatementReport> => {
    const response = await apiClient.get<ApiSuccessResponse<LedgerStatementReport>>(
      API_ENDPOINTS.finance.ledgerStatement,
      { params },
    );
    return response.data.data;
  },

  getLedgerEntries: async (
    params: {
      ledger_id?: number;
      from_date?: string;
      to_date?: string;
    } = {},
  ): Promise<LedgerEntriesReport> => {
    const response = await apiClient.get<ApiSuccessResponse<LedgerEntriesReport>>(
      API_ENDPOINTS.finance.ledgerEntries,
      { params },
    );
    return response.data.data;
  },

  getReconciliation: async (ledgerId?: number): Promise<ReconciliationReport> => {
    const response = await apiClient.get<ApiSuccessResponse<ReconciliationReport>>(
      API_ENDPOINTS.finance.reconciliation,
      { params: ledgerId ? { ledger_id: ledgerId } : undefined },
    );
    return response.data.data;
  },

  updateReconciliation: async (payload: ReconciliationUpdatePayload) => {
    const response = await apiClient.post<ApiSuccessResponse<Record<string, unknown>>>(
      API_ENDPOINTS.finance.reconciliation,
      payload,
    );
    return response.data;
  },
};
