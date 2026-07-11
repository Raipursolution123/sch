export interface FeeCollectRosterStudent {
  student_id: number;
  admission_no: string;
  roll_no: number | null;
  full_name: string;
  total_due: number;
  total_paid: number;
  total_balance: number;
}

export interface FeeCollectRoster {
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  session_name: string;
  students: FeeCollectRosterStudent[];
}
