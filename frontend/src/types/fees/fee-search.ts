export interface FeeDueSearchStudent {
  student_id: number;
  admission_no: string;
  roll_no: number | null;
  full_name: string;
  class_id: number | null;
  class_name: string;
  section_id: number | null;
  section_name: string;
  total_due: number;
  total_paid: number;
  total_balance: number;
}

export interface FeeDueSearchResult {
  session_name: string;
  class_id: number | null;
  class_name: string | null;
  section_id: number | null;
  section_name: string | null;
  total_students: number;
  total_balance: number;
  students: FeeDueSearchStudent[];
}

export interface FeeDueSearchFilters {
  class_id?: number;
  section_id?: number;
  q?: string;
  min_balance?: number;
}

export interface FeePaymentSearchRow {
  payment_id: string;
  date: string;
  amount: number;
  payment_mode: string;
  description: string | null;
  feetype_name: string | null;
  feetype_code: string | null;
  student_id: number;
  admission_no: string;
  full_name: string;
  roll_no: number | null;
  class_name: string;
  section_name: string;
}

export interface FeePaymentSearchResult {
  session_name: string;
  from_date: string;
  to_date: string;
  total_payments: number;
  total_amount: number;
  payments: FeePaymentSearchRow[];
}

export interface FeePaymentSearchFilters {
  from_date: string;
  to_date: string;
  class_id?: number;
  section_id?: number;
  q?: string;
  payment_mode?: string;
}
