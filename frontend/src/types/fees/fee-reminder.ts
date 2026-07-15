import type { ActiveFlag } from '@app-types/settings/session';

export interface FeeReminder {
  id: number;
  reminder_type: string | null;
  day: number | null;
  is_active: ActiveFlag;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UpdateFeeReminderPayload {
  day: number;
  is_active: ActiveFlag;
}
