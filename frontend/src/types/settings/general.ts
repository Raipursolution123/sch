/** Subset of `sch_settings` exposed via General Settings UI (MVP tabs). */

export type RtlMode = 'enabled' | 'disabled';

export interface GeneralSettings {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  dise_code: string;
  timezone: string;
  date_format: string;
  time_format: string;
  start_month: string;
  start_week: string;
  day_off: string;
  is_rtl: RtlMode;
  attendence_type: number;
  low_attendance_limit: number;
  class_teacher: string;
  currency: string;
  currency_symbol: string;
  currency_place: string;
  collect_back_date_fees: number;
  fee_due_days: number;
  is_duplicate_fees_invoice: string;
  maintenance_mode: number;
  lock_grace_period: number;
  student_panel_login: number;
  parent_panel_login: number;
}

export type GeneralSettingsTab =
  | 'school-profile'
  | 'regional'
  | 'attendance'
  | 'fees'
  | 'maintenance';

export type SchoolProfilePayload = Pick<
  GeneralSettings,
  'name' | 'email' | 'phone' | 'address' | 'dise_code'
>;

export type RegionalPayload = Pick<
  GeneralSettings,
  'timezone' | 'date_format' | 'time_format' | 'start_month' | 'start_week' | 'day_off' | 'is_rtl'
>;

export type AttendanceSettingsPayload = Pick<
  GeneralSettings,
  'attendence_type' | 'low_attendance_limit' | 'class_teacher'
>;

export type FeesSettingsPayload = Pick<
  GeneralSettings,
  | 'currency'
  | 'currency_symbol'
  | 'currency_place'
  | 'collect_back_date_fees'
  | 'fee_due_days'
  | 'is_duplicate_fees_invoice'
>;

export type MaintenancePayload = Pick<
  GeneralSettings,
  | 'maintenance_mode'
  | 'lock_grace_period'
  | 'student_panel_login'
  | 'parent_panel_login'
>;

export type GeneralSettingsUpdatePayload =
  | SchoolProfilePayload
  | RegionalPayload
  | AttendanceSettingsPayload
  | FeesSettingsPayload
  | MaintenancePayload;
