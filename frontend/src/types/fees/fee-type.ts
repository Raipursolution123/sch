import type { ActiveFlag } from '@app-types/settings/session';

export interface FeeCategory {
  id: number;
  name: string;
  is_active: ActiveFlag;
  created_at: string;
}

export interface FeeType {
  id: number;
  code: string;
  name: string;
  feecategory_id: number | null;
  category_name: string | null;
  description: string | null;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface CreateFeeTypePayload {
  code: string;
  name: string;
  feecategory_id: number | null;
  description: string | null;
  is_active: ActiveFlag;
}

export type UpdateFeeTypePayload = CreateFeeTypePayload;
