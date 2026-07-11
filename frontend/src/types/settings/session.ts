export type ActiveFlag = 'yes' | 'no';

/** @deprecated Import from `@features/academics/sessions/types/session.types` for new code. */
export interface AcademicSession {
  id: number;
  session: string;
  is_active: ActiveFlag;
  is_current?: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateSessionPayload {
  session: string;
}

export interface UpdateSessionPayload {
  session: string;
}
