import { ModuleSubNavLayout, type ModuleNavItem } from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

export const REPORTS_MODULE_NAV: ModuleNavItem[] = [
  { label: 'Overview', path: ROUTES.reports.hub },
  { label: 'Students', path: ROUTES.reports.students },
  { label: 'Attendance', path: ROUTES.reports.attendance },
  { label: 'Fees', path: ROUTES.reports.fees },
  { label: 'Examinations', path: ROUTES.reports.examinations },
  { label: 'Finance', path: ROUTES.reports.finance },
  { label: 'HR', path: ROUTES.reports.hr },
  { label: 'Transport', path: ROUTES.reports.transport },
  { label: 'Library', path: ROUTES.reports.library },
  { label: 'Inventory', path: ROUTES.reports.inventory },
  { label: 'Homework', path: ROUTES.reports.homework },
  { label: 'Alumni', path: ROUTES.reports.alumni },
  { label: 'Lesson plan', path: ROUTES.reports.lessonPlan },
  { label: 'User log', path: ROUTES.reports.userLog },
  { label: 'Audit trail', path: ROUTES.reports.auditTrail },
  { label: 'Online exams', path: ROUTES.reports.onlineExams },
  { label: 'Timetable', path: ROUTES.reports.timetable },
];

export function ReportsModuleLayout() {
  return <ModuleSubNavLayout title="Reports" nav={REPORTS_MODULE_NAV} />;
}
