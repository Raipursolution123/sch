export interface Incident {
  id: number;
  title: string;
  point: number;
  description: string;
  created_at: string;
}

export interface StudentIncident {
  id: number;
  session_id: number;
  student_id: number;
  incident_id: number;
  assign_by: number;
  created_at: string;
}

export interface StudentIncidentDetail {
  id: number;
  session_id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  class_name: string;
  section_name: string;
  incident_id: number;
  incident_title: string;
  incident_description: string;
  incident_point: number;
  assign_by_name: string;
  created_at: string;
}

export interface IncidentComment {
  id: number;
  student_incident_id: number;
  comment: string;
  type: 'student' | 'staff';
  staff_id?: number | null;
  student_id?: number | null;
  staff_name?: string;
  student_name?: string;
  created_date: string;
}

export interface BehaviourSetting {
  id: number;
  comment_option: string; // JSON string of comments
  created_at: string;
}
