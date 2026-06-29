import type { ActiveFlag } from '@app-types/settings/session';

export interface ExamGroup {
  id: number;
  name: string;
  exam_type: string;
  description: string | null;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface CreateExamGroupPayload {
  name: string;
  exam_type: string;
  description: string | null;
  is_active: ActiveFlag;
}

export type UpdateExamGroupPayload = CreateExamGroupPayload;
