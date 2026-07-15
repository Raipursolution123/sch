import type { ActiveFlag } from '@app-types/settings/session';

export type FeeDiscountType = 'percentage' | 'fixed';

export interface FeeDiscount {
  id: number;
  session_id: number;
  session_name: string | null;
  name: string;
  code: string;
  type: FeeDiscountType | string;
  percentage: number | null;
  amount: number | null;
  description: string | null;
  is_active: ActiveFlag;
  created_at: string | null;
}

export interface CreateFeeDiscountPayload {
  session_id: number;
  name: string;
  code: string;
  type: FeeDiscountType;
  percentage: number | null;
  amount: number | null;
  description: string | null;
  is_active: ActiveFlag;
}

export type UpdateFeeDiscountPayload = CreateFeeDiscountPayload;
