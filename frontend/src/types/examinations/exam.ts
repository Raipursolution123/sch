import type { ActiveFlag } from '@app-types/settings/session';

export interface Exam {
  id: number;
  name: string;
  exam_group_id: number;
  exam_group_name: string;
  session_id: number;
  session_name: string;
  date_from: string | null;
  date_to: string | null;
  passing_percentage: number | null;
  is_published: boolean;
  is_active: ActiveFlag;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateExamPayload {
  name: string;
  exam_group_id: number;
  session_id: number;
  date_from: string | null;
  date_to: string | null;
  passing_percentage: number | null;
  is_published: boolean;
  is_active: ActiveFlag;
  description: string | null;
}

export type UpdateExamPayload = CreateExamPayload;
