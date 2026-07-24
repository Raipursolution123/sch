export interface Homework {
  id: number;
  class_id: number;
  section_id: number;
  session_id: number;
  staff_id: number;
  subject_group_subject_id: number | null;
  subject_id: number | null;
  homework_date: string;
  submit_date: string;
  marks: number | null;
  description: string | null;
  assigned_to_house: number | null;
  assigned_to_president: number | null;
  create_date: string;
  evaluation_date: string | null;
  document: string | null;
  created_by: number;
  evaluated_by: number | null;
  created_at: string | null;
}

export interface CreateHomeworkPayload {
  class_id: number;
  section_id: number;
  session_id: number;
  staff_id: number;
  subject_id?: number | null;
  subject_group_subject_id?: number | null;
  homework_date: string;
  submit_date: string;
  marks?: number | null;
  description?: string | null;
  create_date: string;
  created_by: number;
  document?: string | null;
  evaluation_date?: string | null;
  evaluated_by?: number | null;
}

export type UpdateHomeworkPayload = Partial<CreateHomeworkPayload>;

export interface HomeworkListFilters {
  class_id?: number;
  section_id?: number;
  session_id?: number;
  subject_id?: number;
  staff_id?: number;
  search?: string;
  page?: number;
}

export interface DailyAssignment {
  id: number;
  student_session_id: number;
  subject_group_subject_id: number;
  title: string | null;
  description: string | null;
  attachment: string | null;
  evaluated_by: number | null;
  date: string | null;
  evaluation_date: string | null;
  remark: string;
  created_at: string;
}

export interface CreateDailyAssignmentPayload {
  student_session_id: number;
  subject_group_subject_id: number;
  title?: string | null;
  description?: string | null;
  attachment?: string | null;
  evaluated_by?: number | null;
  date?: string | null;
  evaluation_date?: string | null;
  remark: string;
}

export type UpdateDailyAssignmentPayload = Partial<CreateDailyAssignmentPayload>;

export interface DailyAssignmentListFilters {
  student_session_id?: number;
  subject_group_subject_id?: number;
  evaluated_by?: number;
  search?: string;
  page?: number;
}
