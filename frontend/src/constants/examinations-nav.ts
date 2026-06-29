import { ROUTES } from './routes';

export interface ExaminationsNavItem {
  label: string;
  path?: string;
  disabled?: boolean;
}

/** Single source for Examinations links in the main sidebar. */
export const EXAMINATIONS_NAV: ExaminationsNavItem[] = [
  { label: 'Exam Groups', path: ROUTES.examinations.groups },
  { label: 'Exams', path: ROUTES.examinations.exams },
  { label: 'Schedule', path: ROUTES.examinations.schedule },
];
