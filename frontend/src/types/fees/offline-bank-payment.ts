export type OfflineBankPaymentStatus = 'pending' | 'approved' | 'rejected';

export interface OfflineBankPayment {
  id: number;
  invoice_id: string;
  student_session_id: number | null;
  student_fees_master_id: number | null;
  fee_groups_feetype_id: number | null;
  student_transport_fee_id: number | null;
  payment_date: string | null;
  bank_from: string;
  bank_account_transferred: string;
  reference: string;
  amount: number;
  submit_date: string | null;
  approve_date: string | null;
  attachment: string;
  reply: string;
  approved_by: number | null;
  approver_name: string;
  is_active: string;
  status: OfflineBankPaymentStatus;
  created_at: string | null;
  alt_mobile_no: string;
  student_id: number | null;
  admission_no: string;
  full_name: string;
  class_name: string;
  section_name: string;
  feetype_name: string;
  feetype_code: string;
}

export interface OfflineBankPaymentFilters {
  status?: OfflineBankPaymentStatus | 'all';
  from_date?: string;
  to_date?: string;
  q?: string;
  page?: number;
}

export interface OfflineBankPaymentActionPayload {
  reply?: string;
}
