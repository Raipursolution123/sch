export interface NotificationSetting {
  id: number;
  type?: string | null;
  is_mail?: string | null; // typically '0' or '1'
  is_sms?: string | null; // typically '0' or '1'
  is_notification: number;
  display_notification: number;
  display_sms: number;
  is_student_recipient?: number | null;
  is_guardian_recipient?: number | null;
  is_staff_recipient?: number | null;
  display_student_recipient?: number | null;
  display_guardian_recipient?: number | null;
  display_staff_recipient?: number | null;
  subject: string;
  template_id: string;
  template: string;
  variables: string;
  created_at: string;
}

export type NotificationSettingUpdatePayload = Partial<
  Omit<NotificationSetting, 'id' | 'created_at'>
>;
