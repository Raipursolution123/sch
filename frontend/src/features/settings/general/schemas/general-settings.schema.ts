import { z } from 'zod';

export const schoolProfileSchema = z.object({
  name: z.string().min(2, 'School name is required').max(100),
  email: z.string().email('Enter a valid email').max(100),
  phone: z.string().max(50),
  address: z.string().max(2000),
  dise_code: z.string().max(50),
});

export const regionalSchema = z.object({
  timezone: z.string().min(1, 'Select a timezone'),
  date_format: z.string().min(1, 'Select a date format'),
  time_format: z.string().min(1, 'Select a time format'),
  start_month: z.string().min(1, 'Select start month'),
  start_week: z.string().min(1, 'Select start day of week'),
  day_off: z.string(),
  is_rtl: z.enum(['enabled', 'disabled']),
});

export const attendanceSettingsSchema = z.object({
  attendence_type: z.number().int().min(0).max(10),
  low_attendance_limit: z.number().min(0).max(100),
  class_teacher: z.enum(['enabled', 'disabled']),
});

export const feesSettingsSchema = z.object({
  currency: z.string().min(1, 'Currency code is required').max(50),
  currency_symbol: z.string().min(1, 'Currency symbol is required').max(50),
  currency_place: z.string().min(1, 'Select currency placement'),
  collect_back_date_fees: z.number().int().min(0).max(1),
  fee_due_days: z.number().int().min(0).max(365),
  is_duplicate_fees_invoice: z.enum(['0', '1']),
});

export const maintenanceSchema = z.object({
  maintenance_mode: z.number().int().min(0).max(1),
  lock_grace_period: z.number().int().min(0).max(365),
  student_panel_login: z.number().int().min(0).max(1),
  parent_panel_login: z.number().int().min(0).max(1),
});

export type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>;
export type RegionalFormValues = z.infer<typeof regionalSchema>;
export type AttendanceSettingsFormValues = z.infer<typeof attendanceSettingsSchema>;
export type FeesSettingsFormValues = z.infer<typeof feesSettingsSchema>;
export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;
