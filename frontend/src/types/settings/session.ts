export type ActiveFlag = 'yes' | 'no';

export interface AcademicSession {
  id: number;
  session: string;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface CreateSessionPayload {
  session: string;
}

export interface UpdateSessionPayload {
  session: string;
}
