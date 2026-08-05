export interface FeeReceipt {
  payment_id: string;
  receipt_no: number | null;
  date: string;
  amount: number;
  payment_mode: string;
  description: string | null;
  feetype_id?: number | null;
  feetype_name: string | null;
  student_id: number;
  admission_no: string;
  full_name: string;
  class_name: string;
  section_name: string | null;
  collected_by?: string | null;
}
