export interface LedgerGroup {
  id: number;
  name: string;
  code?: string;
  parent_id?: number | null;
  affects_gross: number;
}

export interface LedgerGroupCreatePayload {
  name: string;
  code?: string;
  parent_id?: number | null;
  affects_gross: number;
}

export type LedgerGroupUpdatePayload = Partial<LedgerGroupCreatePayload>;

export interface Ledger {
  id: number;
  group_id: number;
  name: string;
  code?: string;
  op_balance: string;
  op_balance_dc: 'D' | 'C';
  type: number;
  reconciliation: number;
  feetype_id?: number | null;
  fee_types?: string | null;
  is_link_to_transport_fee: number;
  income_head_id?: number | null;
  expenses_head_id?: number | null;
  is_link_to_payroll?: number | null;
  notes: string;
}

export interface LedgerCreatePayload {
  group_id: number;
  name: string;
  code?: string;
  op_balance?: string;
  op_balance_dc?: 'D' | 'C';
  notes?: string;
  type?: number;
  reconciliation?: number;
  is_link_to_transport_fee?: number;
  feetype_id?: number | null;
  fee_types?: string | null;
  income_head_id?: number | null;
  expenses_head_id?: number | null;
  is_link_to_payroll?: number | null;
}

export type LedgerUpdatePayload = Partial<LedgerCreatePayload>;

export interface TrialBalanceRow {
  ledger_id: number;
  ledger_name: string;
  group_name?: string | null;
  total_dr: number | string;
  total_cr: number | string;
  closing_dr?: number | string;
  closing_cr?: number | string;
}

export interface TrialBalanceTotals {
  total_dr: number | string;
  total_cr: number | string;
}

export interface TrialBalanceReport {
  from_date: string | null;
  to_date: string | null;
  rows: TrialBalanceRow[];
  totals: TrialBalanceTotals;
}

export interface BalanceSheetLine {
  ledger_id: number;
  ledger_name: string;
  group_name?: string | null;
  amount: number | string;
}

export interface BalanceSheetTotals {
  assets: number | string;
  liabilities: number | string;
  difference: number | string;
}

export interface BalanceSheetReport {
  as_of: string | null;
  assets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  totals: BalanceSheetTotals;
}

export interface ProfitLossLine {
  ledger_id: number;
  ledger_name: string;
  group_name?: string | null;
  affects_gross?: number;
  amount: number | string;
}

export interface ProfitLossTotals {
  gross_profit: number | string;
  net_profit: number | string;
  total_income: number | string;
  total_expenses: number | string;
}

export interface ProfitLossReport {
  from_date: string | null;
  to_date: string | null;
  income: ProfitLossLine[];
  expenses: ProfitLossLine[];
  totals: ProfitLossTotals;
}

export interface LedgerStatementLine {
  entry_id: number;
  item_id: number;
  date: string | null;
  entry_number?: number | null;
  narration: string;
  dc: string;
  amount: number | string;
  running_balance: number | string;
  reconciliation_date?: string | null;
}

export interface LedgerStatementReport {
  ledger_id: number;
  ledger_name: string;
  from_date: string | null;
  to_date: string | null;
  opening_balance: number | string;
  closing_balance: number | string;
  lines: LedgerStatementLine[];
}

export interface LedgerEntryRow {
  entry_id: number;
  date: string | null;
  entry_number?: number | null;
  ledger_id: number;
  ledger_name: string;
  dc: string;
  amount: number | string;
  narration: string;
}

export interface LedgerEntriesReport {
  from_date: string | null;
  to_date: string | null;
  ledger_id: number | null;
  rows: LedgerEntryRow[];
}

export interface ReconciliationItem {
  item_id: number;
  ledger_id: number;
  ledger_name?: string | null;
  entry_id: number;
  date: string | null;
  amount: number | string;
  dc: string;
  narration?: string | null;
  reconciliation_date: string | null;
  is_reconciled: boolean;
}

export interface ReconciliationReport {
  ledgers: Array<{ id: number; name: string }>;
  items: ReconciliationItem[];
}

export interface ReconciliationUpdatePayload {
  item_id: number;
  reconciliation_date: string | null;
}

export interface FinanceReportsIndex {
  reports: Array<{ key: string; label: string; path: string }>;
}

export interface DateRangeFilters {
  from_date?: string;
  to_date?: string;
}

export interface EntryType {
  id: number;
  label: string;
  name: string;
  description?: string;
  base_type?: number;
  numbering?: number;
  prefix?: string;
  suffix?: string;
  zero_padding?: number;
  restriction_bankcash?: number;
}

export type JournalDc = 'dr' | 'cr';

export interface JournalEntryItem {
  id?: number;
  entry_id?: number;
  ledger_id: number;
  amount: string | number;
  dc: JournalDc | string;
  reconciliation_date?: string | null;
  narration?: string;
}

export interface JournalEntry {
  id: number;
  tag_id?: number | null;
  entrytype_id: number;
  number?: number | null;
  date: string;
  dr_total: string | number;
  cr_total: string | number;
  notes?: string;
  transaction_id?: string;
  items: JournalEntryItem[];
}

export interface JournalEntryCreatePayload {
  entrytype_id: number;
  date: string;
  notes?: string;
  tag_id?: number | null;
  number?: number | null;
  transaction_id?: string;
  items: Array<{
    ledger_id: number;
    amount: number;
    dc: JournalDc;
    narration?: string;
  }>;
}

export interface FeeHeadMapper {
  fhl_id: number;
  ledger_id: number;
  head_id: number;
}

export interface FeeHeadMapperPayload {
  ledger_id: number;
  head_id: number;
}

export type FeeHeadMapperUpdatePayload = Partial<FeeHeadMapperPayload>;
