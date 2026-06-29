export type StudentFeeLineStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export interface StudentFeeLine {
  id: string;
  feetype_id: number;
  feetype_code: string;
  feetype_name: string;
  fee_group_name: string;
  amount: number;
  amount_paid: number;
  balance: number;
  due_date: string | null;
  status: StudentFeeLineStatus;
}

export interface StudentFeePayment {
  id: number;
  date: string;
  amount: number;
  payment_mode: string;
  description: string | null;
  feetype_name: string | null;
}

export interface StudentFeeSummary {
  student_id: number;
  session_name: string;
  class_name: string;
  section_name: string | null;
  total_due: number;
  total_paid: number;
  total_balance: number;
  lines: StudentFeeLine[];
  payments: StudentFeePayment[];
}
