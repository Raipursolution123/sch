import type { ActiveFlag } from '@app-types/settings/session';

export interface Section {
  id: number;
  section_name: string;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface CreateSectionPayload {
  section_name: string;
  is_active: ActiveFlag;
}

export interface UpdateSectionPayload extends CreateSectionPayload {}
