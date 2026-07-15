import type { ActiveFlag } from '@app-types/settings/session';

export interface LeaveType {
  id: number;
  name: string;
  is_active: ActiveFlag;
}

export interface CreateLeaveTypePayload {
  name: string;
  is_active: ActiveFlag;
}

export type UpdateLeaveTypePayload = CreateLeaveTypePayload;
