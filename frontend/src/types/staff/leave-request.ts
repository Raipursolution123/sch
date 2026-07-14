export type StaffLeaveStatus = 'pending' | 'approved' | 'rejected';

export interface StaffLeaveRequest {
  id: number;
  staff_id: number;
  staff_name: string | null;
  employee_id: string | null;
  leave_type_id: number;
  leave_type_name: string | null;
  leave_from: string | null;
  leave_to: string | null;
  leave_days: number;
  employee_remark: string | null;
  admin_remark: string | null;
  status: StaffLeaveStatus;
  applied_by: number | null;
  document_file: string | null;
  date: string | null;
  created_at?: string | null;
}

export interface CreateStaffLeaveRequestPayload {
  staff_id: number;
  leave_type_id: number;
  leave_from: string;
  leave_to: string;
  leave_days?: number;
  employee_remark?: string;
}

export interface ReviewStaffLeavePayload {
  status: 'approved' | 'rejected';
  admin_remark?: string | null;
}
