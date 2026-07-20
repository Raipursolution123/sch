export interface VisitorsBookEntry {
  id: number;
  staff_id: number | null;
  student_session_id: number | null;
  source: string | null;
  purpose: string;
  name: string;
  email: string | null;
  contact: string;
  id_proof: string;
  no_of_people: number;
  date: string;
  in_time: string;
  out_time: string;
  note: string;
  image: string | null;
  meeting_with: string;
  created_at: string;
}

export interface CreateVisitorsBookPayload {
  staff_id?: number | null;
  student_session_id?: number | null;
  source?: string | null;
  purpose: string;
  name: string;
  email?: string | null;
  contact: string;
  id_proof?: string;
  no_of_people?: number;
  date: string;
  in_time?: string;
  out_time?: string;
  note?: string;
  image?: string | null;
  meeting_with?: string;
}

export type UpdateVisitorsBookPayload = Partial<CreateVisitorsBookPayload>;
