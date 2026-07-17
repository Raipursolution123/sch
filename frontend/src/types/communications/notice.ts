import type { ActiveFlag } from '@app-types/settings/session';

export interface Notice {
  id: number;
  title: string | null;
  message: string | null;
  publish_date: string | null;
  date: string | null;
  attachment: string | null;
  visible_student: string | null;
  visible_staff: string | null;
  visible_parent: string | null;
  created_by: string | null;
  created_id: number | null;
  is_active: ActiveFlag | string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateNoticePayload {
  title: string;
  message?: string | null;
  publish_date?: string | null;
  date?: string | null;
  attachment?: string | null;
  visible_student?: string | boolean;
  visible_staff?: string | boolean;
  visible_parent?: string | boolean;
  is_active?: string | boolean;
}

export type UpdateNoticePayload = Partial<CreateNoticePayload>;
