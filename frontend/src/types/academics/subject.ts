import type { ActiveFlag } from '@app-types/settings/session';

export interface Subject {
  id: number;
  name: string;
  code: string;
  type: string;
  is_active: ActiveFlag;
  linked_class: string | null;
  linked_class_ids: number[];
  linked_class_labels: string[];
  created_at: string;
  updated_at: string | null;
}

export interface CreateSubjectPayload {
  name: string;
  code: string;
  type: string;
  is_active: ActiveFlag;
  linked_class_ids: number[];
}

export type UpdateSubjectPayload = CreateSubjectPayload;
