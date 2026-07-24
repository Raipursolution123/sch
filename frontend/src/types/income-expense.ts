export interface IncomeHead {
  id: number;
  income_category: string | null;
  description: string | null;
  is_active: string | null;
  is_deleted: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ExpenseHead {
  id: number;
  exp_category: string | null;
  description: string | null;
  is_active: string | null;
  is_deleted: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface IncomeRecord {
  id: number;
  income_head_id: number | null;
  name: string | null;
  invoice_no: string | null;
  date: string | null;
  amount: number | null;
  note: string | null;
  documents: string | null;
  is_active: string | null;
  is_deleted: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ExpenseRecord {
  id: number;
  exp_head_id: number | null;
  name: string | null;
  invoice_no: string | null;
  date: string | null;
  amount: number | null;
  note: string | null;
  documents: string | null;
  is_active: string | null;
  is_deleted: string | null;
  created_at: string;
  updated_at: string | null;
}

export type CreateIncomeHeadPayload = {
  income_category: string;
  description?: string | null;
  is_active?: string;
};
export type UpdateIncomeHeadPayload = Partial<CreateIncomeHeadPayload>;

export type CreateExpenseHeadPayload = {
  exp_category: string;
  description?: string | null;
  is_active?: string;
};
export type UpdateExpenseHeadPayload = Partial<CreateExpenseHeadPayload>;

export type CreateIncomePayload = {
  income_head_id?: number | null;
  name: string;
  invoice_no?: string | null;
  date?: string;
  amount?: number;
  note?: string | null;
};
export type UpdateIncomePayload = Partial<CreateIncomePayload>;

export type CreateExpensePayload = {
  exp_head_id?: number | null;
  name: string;
  invoice_no?: string | null;
  date?: string;
  amount?: number;
  note?: string | null;
};
export type UpdateExpensePayload = Partial<CreateExpensePayload>;
