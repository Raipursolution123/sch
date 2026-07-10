export interface PromotePreviewStudent {
  student_id: number;
  student_session_id: number;
  admission_no: string | null;
  name: string | null;
  current_class_name: string | null;
  current_section_name: string | null;
  eligible: boolean;
  blockers: string[];
  fee_warning: boolean;
}

export interface PromotePreview {
  eligible_count: number;
  already_in_target_count: number;
  inactive_skipped_count: number;
  students: PromotePreviewStudent[];
  warnings: string[];
}

export interface PromotePreviewParams {
  from_session_id: number;
  from_class_id: number;
  from_section_id: number;
  to_session_id: number;
  to_class_id: number;
  to_section_id: number;
}

export interface PromoteExecutePayload extends PromotePreviewParams {
  to_subject_group_id?: number | null;
  student_ids?: number[];
  deactivate_source?: boolean;
  mark_alumni?: boolean;
}

export interface PromoteExecuteResult {
  promoted_count: number;
  skipped_count: number;
  promoted: Array<{
    student_id: number;
    new_student_session_id: number;
  }>;
}

export interface PromoteWizardState {
  fromSessionId?: number;
  fromClassId?: number;
  fromSectionId?: number;
  toSessionId?: number;
  toClassId?: number;
  toSectionId?: number;
  toSubjectGroupId?: number | null;
  deactivateSource: boolean;
  markAlumni: boolean;
  selectedStudentIds: number[];
}
