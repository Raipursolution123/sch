export interface FeeDiscountAssignRosterStudent {
  student_id: number;
  student_session_id: number;
  admission_no: string | null;
  roll_no: string | number | null;
  full_name: string;
  is_assigned: boolean;
  assignment_id: number | null;
}

export interface FeeDiscountAssignRoster {
  fees_discount_id: number;
  discount_name: string | null;
  discount_code: string | null;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  session_id: number;
  session_name: string;
  students: FeeDiscountAssignRosterStudent[];
}

export interface AssignFeeDiscountPayload {
  fees_discount_id: number;
  student_session_ids: number[];
  description?: string | null;
}

export interface AssignFeeDiscountResult {
  fees_discount_id: number;
  assigned_count: number;
  skipped_count: number;
}
