export interface ExamEnrollmentRosterStudent {
  student_id: number;
  student_session_id: number;
  admission_no: string | null;
  roll_no: string | number | null;
  full_name: string;
  is_enrolled: boolean;
  enrollment_id: number | null;
}

export interface ExamEnrollmentRoster {
  exam_id: number;
  exam_name: string | null;
  exam_group_id: number | null;
  session_id: number | null;
  session_name: string | null;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  students: ExamEnrollmentRosterStudent[];
}

export interface EnrollExamStudentsPayload {
  exam_id: number;
  student_session_ids: number[];
}

export interface EnrollExamStudentsResult {
  exam_id: number;
  enrolled_count: number;
  created_count: number;
  reactivated_count: number;
  skipped_count: number;
}
