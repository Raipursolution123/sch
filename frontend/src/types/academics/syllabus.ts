export interface SubjectSyllabus {
  id: number;
  topic_id: number;
  session_id: number;
  created_by: number;
  created_for: number;
  date: string;
  time_from: string;
  time_to: string;
  presentation: string;
  attachment?: string;
  lacture_youtube_url?: string;
  lacture_video?: string;
  sub_topic: string;
  teaching_method: string;
  general_objectives: string;
  previous_knowledge: string;
  comprehensive_questions: string;
  status: number;
  created_at: string | null;
}

export interface CreateSubjectSyllabusPayload {
  topic_id: number;
  date: string;
  time_from: string;
  time_to: string;
  presentation?: string;
  lacture_youtube_url?: string;
  lacture_video?: string;
  sub_topic?: string;
  teaching_method?: string;
  general_objectives?: string;
  previous_knowledge?: string;
  comprehensive_questions?: string;
  status?: number;
}

export type UpdateSubjectSyllabusPayload = Partial<CreateSubjectSyllabusPayload>;
