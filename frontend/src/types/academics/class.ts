import type { ActiveFlag } from '@app-types/settings/session';

export interface SchoolClass {
  id: number;
  class_name: string;
  sort_order: number;
  is_hedu_program: boolean;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface CreateClassPayload {
  class_name: string;
  sort_order: number;
  is_hedu_program: boolean;
  is_active: ActiveFlag;
}

export type UpdateClassPayload = CreateClassPayload;
