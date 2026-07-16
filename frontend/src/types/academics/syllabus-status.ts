export interface SyllabusStatus {
  id: number;
  topic_id: number;
  topic_name?: string | null;
  lesson_id?: number | null;
  class_section_id?: number | null;
  subject_id?: number | null;
  subject_group_id?: number | null;
  session_id: number;
  created_by: number;
  created_for: number;
  date: string;
  time_from: string;
  time_to: string;
  presentation: string | null;
  attachment: string | null;
  lacture_youtube_url: string | null;
  lacture_video: string | null;
  sub_topic: string | null;
  teaching_method: string | null;
  general_objectives: string | null;
  previous_knowledge: string | null;
  comprehensive_questions: string | null;
  status: number;
  created_at: string;
}

export interface SyllabusStatusUpdatePayload {
  topic_id?: number;
  session_id?: number;
  created_by?: number;
  created_for?: number;
  date?: string;
  time_from?: string;
  time_to?: string;
  presentation?: string;
  sub_topic?: string;
  status?: number;
}

export interface SyllabusStatusCreatePayload {
  topic_id: number;
  session_id: number;
  created_by: number;
  created_for: number;
  date: string;
  time_from?: string;
  time_to?: string;
  presentation?: string;
  sub_topic?: string;
  status?: number;
}
