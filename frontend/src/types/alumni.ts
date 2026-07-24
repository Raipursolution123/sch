export interface AlumniStudent {
  id: number;
  student_id: number;
  admission_no?: string | null;
  student_name?: string | null;
  current_email: string;
  current_phone: string;
  occupation: string;
  address: string;
  photo?: string | null;
  created_at?: string | null;
}

export interface AlumniStudentCreatePayload {
  student_id: number;
  current_email?: string;
  current_phone?: string;
  occupation?: string;
  address?: string;
  photo?: string | null;
}

export type AlumniStudentUpdatePayload = Partial<AlumniStudentCreatePayload>;

export interface AlumniEvent {
  id: number;
  title: string;
  event_for: string;
  session_id?: number | null;
  session_name?: string | null;
  class_id?: number | null;
  class_name?: string | null;
  section: string;
  from_date: string;
  to_date: string;
  note: string;
  photo?: string | null;
  is_active: number;
  event_notification_message: string;
  show_onwebsite: number;
  created_at?: string | null;
}

export interface AlumniEventCreatePayload {
  title: string;
  event_for?: string;
  session_id?: number | null;
  class_id?: number | null;
  section?: string;
  from_date: string;
  to_date: string;
  note?: string;
  photo?: string | null;
  is_active?: number;
  event_notification_message?: string;
  show_onwebsite?: number;
}

export type AlumniEventUpdatePayload = Partial<AlumniEventCreatePayload>;
