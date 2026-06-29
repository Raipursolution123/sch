import type { ActiveFlag } from '@app-types/settings/session';

export interface FeeAssignmentLine {
  id: number;
  feetype_id: number;
  feetype_code: string;
  feetype_name: string;
  amount: number;
  due_date: string | null;
}

export interface FeeAssignment {
  id: number;
  class_id: number;
  class_name: string;
  fee_group_id: number;
  fee_group_name: string;
  session_id: number;
  session_name: string;
  lines: FeeAssignmentLine[];
  total_amount: number;
  is_active: ActiveFlag;
  created_at: string;
  updated_at: string | null;
}

export interface FeeAssignmentLinePayload {
  feetype_id: number;
  amount: number;
  due_date: string | null;
}

export interface CreateFeeAssignmentPayload {
  class_id: number;
  fee_group_id: number;
  session_id: number;
  lines: FeeAssignmentLinePayload[];
  is_active: ActiveFlag;
}

export type UpdateFeeAssignmentPayload = CreateFeeAssignmentPayload;
