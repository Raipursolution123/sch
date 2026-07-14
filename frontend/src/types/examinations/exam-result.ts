export type ExamResultAttendence = 'present' | 'absent';

export interface ExamResultRosterStudent {
  exam_group_class_batch_exam_student_id: number;
  exam_group_student_id: number | null;
  student_id: number;
  student_session_id: number;
  admission_no: string | null;
  roll_no: number | string | null;
  full_name: string;
  result_id: number | null;
  get_marks: number;
  attendence: ExamResultAttendence | string | null;
  note: string | null;
}

export interface ExamResultRoster {
  exam_id: number;
  exam_name: string | null;
  exam_group_id: number | null;
  session_id: number | null;
  schedule_id: number;
  subject_id: number | null;
  subject_name: string | null;
  full_marks: number | null;
  passing_marks: number | null;
  students: ExamResultRosterStudent[];
}

export interface SaveExamResultEntry {
  exam_group_class_batch_exam_student_id: number;
  exam_group_student_id?: number | null;
  get_marks: number;
  attendence: ExamResultAttendence;
  note?: string | null;
}

export interface SaveExamResultsPayload {
  exam_id: number;
  schedule_id: number;
  entries: SaveExamResultEntry[];
}

export interface SaveExamResultsResult {
  exam_id: number;
  schedule_id: number;
  saved_count: number;
}
