export interface SubjectGroupSubject {
  id: number;
  name: string;
  code: string;
  type: string;
}

export interface SubjectGroupClassSection {
  id: number;
  class_id: number;
  section_id: number;
  class_name: string | null;
  section_name: string | null;
}

export interface SubjectGroup {
  id: number;
  name: string;
  description: string | null;
  session_id: number | null;
  session_name: string | null;
  subject_count: number;
  class_section_count: number;
  subjects?: SubjectGroupSubject[];
  subject_ids?: number[];
  class_sections?: SubjectGroupClassSection[];
  class_section_ids?: number[];
  created_at: string | null;
}

export interface CreateSubjectGroupPayload {
  name: string;
  session_id: number;
  description?: string | null;
  subject_ids?: number[];
  class_section_ids?: number[];
}

export interface UpdateSubjectGroupPayload {
  name?: string;
  description?: string | null;
}

export interface SyncSubjectGroupSubjectsPayload {
  subject_ids: number[];
}

export interface SyncSubjectGroupClassSectionsPayload {
  class_section_ids: number[];
}
