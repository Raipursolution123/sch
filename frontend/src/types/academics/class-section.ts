import type { ActiveFlag } from '@app-types/settings/session';

export interface ClassSection {
  id: number;
  class_id: number;
  section_id: number;
  class_name: string;
  section_name: string;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface CreateClassSectionPayload {
  class_id: number;
  section_id: number;
  is_active: ActiveFlag;
}

export interface UpdateClassSectionPayload {
  is_active: ActiveFlag;
}
