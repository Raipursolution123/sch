import { ROUTES } from './routes';

export interface AttendanceNavItem {
  label: string;
  path?: string;
  disabled?: boolean;
}

/** Single source for Attendance links in the main sidebar. */
export const ATTENDANCE_NAV: AttendanceNavItem[] = [
  { label: 'Mark Attendance', path: ROUTES.attendance.mark },
  { label: 'Report', path: ROUTES.attendance.report },
];
