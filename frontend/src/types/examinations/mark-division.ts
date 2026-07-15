import type { ActiveFlag } from '@app-types/settings/session';

export interface MarkDivision {
  id: number;
  name: string | null;
  percentage_from: number | null;
  percentage_to: number | null;
  is_active: ActiveFlag;
  created_at?: string | null;
}

export interface CreateMarkDivisionPayload {
  name: string;
  percentage_from: number;
  percentage_to: number;
  is_active: ActiveFlag;
}

export type UpdateMarkDivisionPayload = CreateMarkDivisionPayload;
