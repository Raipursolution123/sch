export const DATE_FORMAT_OPTIONS = [
  { value: 'd-m-Y', label: 'DD-MM-YYYY (31-12-2026)' },
  { value: 'm-d-Y', label: 'MM-DD-YYYY (12-31-2026)' },
  { value: 'Y-m-d', label: 'YYYY-MM-DD (2026-12-31)' },
  { value: 'd/m/Y', label: 'DD/MM/YYYY' },
  { value: 'd.M.Y', label: 'DD.MM.YYYY' },
] as const;

export const TIME_FORMAT_OPTIONS = [
  { value: '12-hour', label: '12-hour (2:30 PM)' },
  { value: '24-hour', label: '24-hour (14:30)' },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
] as const;

export const MONTH_OPTIONS = [
  { value: 'January', label: 'January' },
  { value: 'February', label: 'February' },
  { value: 'March', label: 'March' },
  { value: 'April', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'June', label: 'June' },
  { value: 'July', label: 'July' },
  { value: 'August', label: 'August' },
  { value: 'September', label: 'September' },
  { value: 'October', label: 'October' },
  { value: 'November', label: 'November' },
  { value: 'December', label: 'December' },
] as const;

export const WEEKDAY_OPTIONS = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
] as const;

export const CURRENCY_PLACE_OPTIONS = [
  { value: 'before_number', label: 'Before amount (₹ 100)' },
  { value: 'after_number', label: 'After amount (100 ₹)' },
  { value: 'before_with_space', label: 'Before with space (₹ 100)' },
  { value: 'after_with_space', label: 'After with space (100 ₹)' },
] as const;

export const CLASS_TEACHER_OPTIONS = [
  { value: 'disabled', label: 'Disabled' },
  { value: 'enabled', label: 'Enabled' },
] as const;

export const GENERAL_SETTINGS_TABS = [
  { id: 'school-profile', label: 'School Profile' },
  { id: 'regional', label: 'Regional' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'fees', label: 'Fees' },
  { id: 'maintenance', label: 'Maintenance' },
] as const;
