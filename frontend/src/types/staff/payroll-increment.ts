export interface StaffPayrollIncrement {
  pi_id: number;
  staff_id: number;
  staff_name: string;
  employee_id: string;
  month: string;
  year: string;
  basic_salary: number;
  increment: number;
  date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  action_date: string | null;
}

export interface CreatePayrollIncrementPayload {
  staff_id: number;
  month: string;
  year: string;
  increment: number;
}
