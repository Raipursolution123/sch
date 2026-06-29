import type { ActiveFlag } from '@app-types/settings/session';

export interface Language {
  id: number;
  language: string;
  short_code: string;
  country_code: string;
  is_rtl: boolean;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface CreateLanguagePayload {
  language: string;
  short_code: string;
  country_code: string;
  is_rtl: boolean;
  is_active: ActiveFlag;
}

export interface UpdateLanguagePayload extends CreateLanguagePayload {}
