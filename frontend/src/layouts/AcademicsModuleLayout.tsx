import { ModuleSubNavLayout, type ModuleNavItem } from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

export const ACADEMICS_MODULE_NAV: ModuleNavItem[] = [
  { label: 'Sessions', path: ROUTES.academics.sessions },
  { label: 'Classes', path: ROUTES.academics.classes },
  { label: 'Sections', path: ROUTES.academics.sections },
  { label: 'Class sections', path: ROUTES.academics.classSections },
  { label: 'Subjects', path: ROUTES.academics.subjects },
  { label: 'Subject groups', path: ROUTES.academics.subjectGroups },
  { label: 'Timetable', path: ROUTES.academics.timetable },
  { label: 'Teacher timetable', path: ROUTES.academics.teacherTimetable },
  { label: 'Class teacher', path: ROUTES.academics.classTeacher },
  { label: 'Promote', path: ROUTES.academics.promote },
];

export function AcademicsModuleLayout() {
  return <ModuleSubNavLayout title="Academics" nav={ACADEMICS_MODULE_NAV} />;
}
