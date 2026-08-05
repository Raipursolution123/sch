export interface CbseTimetableAssessment {
  timetable_assessment_type_id: number;
  assessment_type_id: number | null;
  assessment_name: string | null;
  assessment_code: string | null;
  maximum_marks: number | null;
}

export interface CbseTimetableSubject {
  id: number;
  cbse_exam_id: number;
  subject_id: number | null;
  subject_name: string | null;
  date: string | null;
  room_no: string | null;
  written_maximum_marks: number;
  maximum_marks: number;
  assessments: CbseTimetableAssessment[];
}

export interface CbseMarksStudentRow {
  cbse_exam_student_id: number;
  student_id: number;
  student_session_id: number;
  admission_no: string | null;
  roll_no: string | number | null;
  full_name: string;
  marks_id: number | null;
  marks: number;
  is_absent: boolean;
  note: string | null;
  marks_grade: string | null;
}

export interface CbseMarksRoster {
  exam_id: number;
  exam_name: string;
  timetable_id: number;
  subject_id: number | null;
  subject_name: string | null;
  assessment_type_id: number | null;
  timetable_assessment_type_id: number;
  assessment_name: string | null;
  maximum_marks: number;
  students: CbseMarksStudentRow[];
}

export interface CbseMarksSavePayload {
  exam_id: number;
  timetable_id: number;
  assessment_type_id?: number | null;
  entries: Array<{
    cbse_exam_student_id: number;
    marks: number;
    is_absent: boolean;
    note?: string | null;
    marks_grade?: string | null;
  }>;
}

export interface CbseMarksheetSubject {
  subject_id: number | null;
  subject_name: string;
  maximum_marks: number;
  obtained_marks: number;
  is_absent: boolean;
  grade: string | null;
}

export interface CbseMarksheet {
  exam_id: number;
  exam_name: string;
  cbse_exam_student_id: number;
  student_id: number;
  student_session_id: number;
  admission_no: string | null;
  roll_no: string | number | null;
  full_name: string;
  class_name: string;
  section_name: string;
  subjects: CbseMarksheetSubject[];
  total_maximum_marks: number;
  total_obtained_marks: number;
  percentage: number;
}
