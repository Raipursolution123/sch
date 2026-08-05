import { ModuleSubNavLayout, type ModuleNavItem } from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

export const EXAMINATIONS_MODULE_NAV: ModuleNavItem[] = [
  { label: 'Exam groups', path: ROUTES.examinations.groups },
  { label: 'Exams', path: ROUTES.examinations.exams },
  { label: 'Enroll', path: ROUTES.examinations.enroll },
  { label: 'Schedule', path: ROUTES.examinations.schedule },
  { label: 'Results', path: ROUTES.examinations.results },
  { label: 'Admit cards', path: ROUTES.examinations.admitCard },
  { label: 'Marksheets', path: ROUTES.examinations.marksheet },
  { label: 'Grades', path: ROUTES.examinations.grades },
  { label: 'Divisions', path: ROUTES.examinations.divisions },
  { label: 'CBSE exams', path: ROUTES.examinations.cbseExams },
];

export function ExaminationsModuleLayout() {
  return <ModuleSubNavLayout title="Examinations" nav={EXAMINATIONS_MODULE_NAV} />;
}
