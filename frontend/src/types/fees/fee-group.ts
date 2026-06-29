import type { ActiveFlag } from '@app-types/settings/session';

export interface FeeGroup {
  id: number;
  name: string;
  description: string | null;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface CreateFeeGroupPayload {
  name: string;
  description: string | null;
  is_active: ActiveFlag;
}

export type UpdateFeeGroupPayload = CreateFeeGroupPayload;
