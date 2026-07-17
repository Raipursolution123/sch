import type { ActiveFlag } from '@app-types/settings/session';

export interface Hostel {
  id: number;
  hostel_name: string | null;
  type: string | null;
  address: string | null;
  intake: number | null;
  description: string | null;
  hostel_incharge: string | null;
  is_active: ActiveFlag | string | null;
  meal_type: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateHostelPayload {
  hostel_name: string;
  type?: string | null;
  address?: string | null;
  intake?: number | null;
  description?: string | null;
  hostel_incharge?: string | null;
  is_active?: string;
  meal_type?: string | null;
}

export type UpdateHostelPayload = Partial<CreateHostelPayload>;
