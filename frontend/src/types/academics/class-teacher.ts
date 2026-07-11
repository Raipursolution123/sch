export interface ClassTeacherAssignment {
  id: number | null;
  class_section_id: number | null;
  session_id: number;
  class_id: number;
  section_id: number;
  staff_id: number | null;
  session_label: string | null;
  class_name: string | null;
  section_name: string | null;
  staff_name: string | null;
  staff_employee_id: string | null;
}

export interface AssignClassTeacherPayload {
  session_id: number;
  class_id: number;
  section_id: number;
  staff_id: number;
}

export interface UpdateClassTeacherPayload {
  staff_id: number;
}
