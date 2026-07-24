import type { FeeAssignment } from '@app-types/fees/fee-assignment';

export interface FeeStudentAssignRow {
  student_id: number;
  student_session_id: number;
  admission_no: string;
  roll_no: number | string | null;
  full_name: string;
  section_id: number | null;
  section_name: string;
  assigned: boolean;
  student_fees_master_id: number | null;
}

export interface FeeStudentAssignRoster {
  fee_session_group_id: number;
  class_id: number;
  class_name: string;
  session_id: number;
  assignment: FeeAssignment;
  students: FeeStudentAssignRow[];
  total_amount: number;
}

export interface SaveFeeStudentAssignPayload {
  fee_session_group_id: number;
  section_id?: number | null;
  student_session_ids: number[];
}

export interface FeeCarryForwardRow {
  student_id: number;
  admission_no: string;
  roll_no: number | string | null;
  full_name: string;
  from_student_session_id: number;
  to_student_session_id: number | null;
  previous_balance: number;
  has_target_enrollment: boolean;
  already_carried: boolean;
}

export interface FeeCarryForwardPreview {
  from_session_id: number;
  from_session_name: string;
  to_session_id: number;
  to_session_name: string;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  students: FeeCarryForwardRow[];
  carried_count?: number;
}

export interface CarryForwardFeesPayload {
  from_session_id: number;
  to_session_id: number;
  class_id: number;
  section_id: number;
  fee_session_group_id: number;
  student_ids: number[];
}
