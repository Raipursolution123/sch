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

export interface LedgerGroupUpdatePayload extends Partial<LedgerGroupCreatePayload> {}

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
