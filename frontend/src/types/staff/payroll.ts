import type { ActiveFlag } from '@app-types/settings/session';

export interface StaffPayScale {
  id: number;
  pay_scale: string;
  grade: string;
  basic_salary: number;
  is_active: ActiveFlag;
}

export interface CreateStaffPayScalePayload {
  pay_scale: string;
  grade?: string;
  basic_salary: number;
  is_active: ActiveFlag;
}

export type UpdateStaffPayScalePayload = CreateStaffPayScalePayload;

export interface StaffPayslip {
  id: number;
  staff_id: number;
  staff_name: string;
  employee_id: string;
  basic: number;
  total_allowance: number;
  total_deduction: number;
  leave_deduction: number;
  tax: string;
  net_salary: number;
  status: string;
  month: string;
  year: string;
  payment_mode: string;
  payment_date: string | null;
  remark: string;
  created_at: string | null;
}

export interface CreateStaffPayslipPayload {
  staff_id: number;
  month: string;
  year: string;
  basic?: number;
  total_allowance?: number;
  total_deduction?: number;
  leave_deduction?: number;
  tax?: string;
  net_salary?: number;
  payment_mode?: string;
  payment_date?: string;
  remark?: string;
  status?: string;
}
