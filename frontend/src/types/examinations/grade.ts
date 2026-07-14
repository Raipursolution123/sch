import type { ActiveFlag } from '@app-types/settings/session';

export interface Grade {
  id: number;
  exam_type: string | null;
  name: string | null;
  point: number | null;
  mark_from: number | null;
  mark_upto: number | null;
  description: string | null;
  is_active: ActiveFlag;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateGradePayload {
  exam_type: string;
  name: string;
  point: number;
  mark_from: number;
  mark_upto: number;
  description?: string | null;
  is_active: ActiveFlag;
}

export type UpdateGradePayload = CreateGradePayload;
