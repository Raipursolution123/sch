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
  total_dr: number | string;
  total_cr: number | string;
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
