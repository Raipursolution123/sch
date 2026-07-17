export interface CbseExam {
  id: number;
  name: string;
  exam_code: string | null;
  session_id: number;
  description: string | null;
  total_working_days: number | null;
  cbse_term_id: number | null;
  cbse_term_group_id: number | null;
  cbse_exam_assessment_id: number | null;
  cbse_exam_grade_id: number | null;
  combined_ew: number | null;
  is_publish: number;
  is_active: number;
  created_by: number | null;
  use_exam_roll_no: number;
  promote_class: string | null;
  created_at?: string | null;
}

export interface CreateCbseExamPayload {
  name: string;
  session_id: number;
  exam_code?: string | null;
  description?: string | null;
  total_working_days?: number;
  is_publish?: number;
  is_active?: number;
}
