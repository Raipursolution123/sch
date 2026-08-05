import { ModuleSubNavLayout, type ModuleNavItem } from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

export const STUDENTS_MODULE_NAV: ModuleNavItem[] = [
  { label: 'All students', path: ROUTES.students.root, end: true },
  { label: 'Categories', path: ROUTES.students.categories },
  { label: 'Houses', path: ROUTES.students.houses },
  { label: 'Disabled', path: ROUTES.students.disabled },
  { label: 'Import', path: ROUTES.students.import },
  { label: 'Online admission', path: ROUTES.students.onlineAdmission },
  { label: 'Bulk delete', path: ROUTES.students.bulkDelete },
  { label: 'Disable reason', path: ROUTES.students.disableReason },
  { label: 'Multi class', path: ROUTES.students.multiClass },
];

export function StudentsModuleLayout() {
  return <ModuleSubNavLayout title="Students" nav={STUDENTS_MODULE_NAV} />;
}
