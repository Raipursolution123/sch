import { ModuleSubNavLayout, type ModuleNavItem } from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

export const ATTENDANCE_MODULE_NAV: ModuleNavItem[] = [
  { label: 'Mark attendance', path: ROUTES.attendance.mark },
  { label: 'Subject attendance', path: ROUTES.attendance.subject },
  { label: 'Period by date', path: ROUTES.attendance.periodAttendanceByDate },
  { label: 'Hostel', path: ROUTES.attendance.hostel },
  { label: 'Report', path: ROUTES.attendance.report },
  { label: 'Approve leave', path: ROUTES.attendance.approveLeave },
];

export function AttendanceModuleLayout() {
  return <ModuleSubNavLayout title="Attendance" nav={ATTENDANCE_MODULE_NAV} />;
}
