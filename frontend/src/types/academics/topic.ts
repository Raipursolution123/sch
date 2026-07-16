export interface Topic {
  id: number;
  session_id: number;
  lesson_id: number;
  name: string;
  status: number;
  complete_date: string | null;
  created_at: string;
  subject_name?: string | null;
  subject_group_name?: string | null;
  class_section_name?: string | null;
  lesson_name?: string | null;
  subject_group_id?: number | null;
  subject_id?: number | null;
  class_section_id?: number | null;
}

export interface TopicCreatePayload {
  session_id: number;
  lesson_id: number;
  name: string;
  status?: number;
  complete_date?: string | null;
}

export interface TopicUpdatePayload {
  session_id?: number;
  lesson_id?: number;
  name?: string;
  status?: number;
  complete_date?: string | null;
}
