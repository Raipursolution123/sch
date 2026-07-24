export type QuestionType = 'singlechoice' | 'multichoice' | 'true_false' | 'descriptive';
export type QuestionLevel = 'low' | 'medium' | 'high';

export interface QuestionBankItem {
  id: number;
  staff_id: number | null;
  subject_id: number | null;
  lesson_id: number | null;
  lesson_name: string | null;
  question_type: string;
  level: string;
  class_id: number;
  section_id: number | null;
  class_section_id: number | null;
  question_parts: string | null;
  question: string | null;
  opt_a: string | null;
  opt_b: string | null;
  opt_c: string | null;
  opt_d: string | null;
  opt_e: string | null;
  correct: string | null;
  qscore: number | null;
  descriptive_word_limit: number;
  created_at: string | null;
  updated_at: string | null;
  qpart_1: number;
  qpart_2: number;
  qpart_3: number;
  qpart_4: number;
  qpart_5: number;
  is_it_offline: number;
}

export type CreateQuestionPayload = {
  class_id: number;
  question_type: string;
  question: string;
  level?: string;
  subject_id?: number | null;
  lesson_id?: number | null;
  lesson_name?: string | null;
  section_id?: number | null;
  class_section_id?: number | null;
  opt_a?: string;
  opt_b?: string;
  opt_c?: string;
  opt_d?: string;
  opt_e?: string;
  correct?: string;
  qscore?: number;
  descriptive_word_limit?: number;
};

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;

export interface OnlineExam {
  id: number;
  session_id: number | null;
  exam: string | null;
  attempt: number;
  exam_from: string | null;
  exam_to: string | null;
  is_quiz: number;
  auto_publish_date: string | null;
  time_from: string | null;
  time_to: string | null;
  duration: string | null;
  passing_percentage: string;
  description: string | null;
  publish_result: number;
  answer_word_count: number;
  is_active: string | null;
  is_marks_display: number;
  is_neg_marking: number;
  is_random_question: number;
  is_rank_generated: number;
  publish_exam_notification: number;
  publish_result_notification: number;
  created_at: string | null;
  updated_at: string | null;
  question_count?: number;
  student_count?: number;
}

export type CreateOnlineExamPayload = {
  session_id: number;
  exam: string;
  attempt?: number;
  duration?: string;
  passing_percentage?: string;
  description?: string | null;
  is_active?: string;
  is_quiz?: number;
  exam_from?: string | null;
  exam_to?: string | null;
};

export type UpdateOnlineExamPayload = Partial<CreateOnlineExamPayload>;

export interface OnlineExamQuestionLink {
  id: number;
  onlineexam_id: number;
  question_id: number;
  session_id: number | null;
  marks: number | string | null;
  neg_marks: number | string | null;
  is_active: string | null;
  question: string | null;
  question_type: string | null;
  level: string | null;
  correct: string | null;
}

export type AddExamQuestionsPayload = {
  questions: Array<{
    question_id: number;
    marks?: number;
    neg_marks?: number;
  }>;
};

export interface OnlineExamRosterStudent {
  student_id: number;
  student_session_id: number;
  admission_no: string | null;
  roll_no: string | number | null;
  full_name: string;
  is_assigned: boolean;
  assignment_id: number | null;
  is_attempted: number;
}

export interface OnlineExamRoster {
  exam_id: number;
  exam_name: string | null;
  session_id: number | null;
  session_name: string | null;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  students: OnlineExamRosterStudent[];
}
