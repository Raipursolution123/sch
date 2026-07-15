export interface Lesson {
  id: number;
  session_id: number;
  subject_group_subject_id: number;
  subject_group_class_sections_id: number;
  name: string;
  created_at: string;
  subject_name?: string | null;
  subject_group_name?: string | null;
  class_section_name?: string | null;
  subject_group_id?: number | null;
  subject_id?: number | null;
  class_section_id?: number | null;
}

export interface LessonCreatePayload {
  session_id: number;
  subject_group_id: number;
  subject_id: number;
  class_section_id: number;
  name: string;
}

export interface LessonUpdatePayload {
  session_id?: number;
  subject_group_id?: number;
  subject_id?: number;
  class_section_id?: number;
  name?: string;
}
