import { ModuleSubNavLayout, type ModuleNavItem } from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

export const STAFF_MODULE_NAV: ModuleNavItem[] = [
  { label: 'All staff', path: ROUTES.staff.root, end: true },
  { label: 'Departments', path: ROUTES.staff.departments },
  { label: 'Designations', path: ROUTES.staff.designations },
  { label: 'Attendance', path: ROUTES.staff.attendance },
  { label: 'Payroll', path: ROUTES.staff.payroll },
  { label: 'Leave types', path: ROUTES.staff.leaveTypes },
  { label: 'Leave requests', path: ROUTES.staff.leave },
  { label: 'Leave allotments', path: ROUTES.staff.leaveAllotments },
];

export function StaffModuleLayout() {
  return <ModuleSubNavLayout title="Staff" nav={STAFF_MODULE_NAV} />;
}
