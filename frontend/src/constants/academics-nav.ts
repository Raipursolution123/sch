import { ROUTES } from './routes';

export interface AcademicsNavItem {
  label: string;
  path?: string;
  disabled?: boolean;
}

/** Single source for Academics links in the main sidebar. */
export const ACADEMICS_NAV: AcademicsNavItem[] = [
  { label: 'Classes', path: ROUTES.academics.classes },
  { label: 'Sections', path: ROUTES.academics.sections },
  { label: 'Class Sections', path: ROUTES.academics.classSections },
  { label: 'Subjects', path: ROUTES.academics.subjects },
];
