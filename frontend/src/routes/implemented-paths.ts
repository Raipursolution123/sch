import { ROUTES } from '@constants/routes';

/** Paths with real page implementations (not Coming Soon placeholders). */
export const IMPLEMENTED_PATHS = new Set<string>([
  ROUTES.dashboard,
  ROUTES.academics.sessions,
  ROUTES.academics.classes,
  ROUTES.academics.sections,
  ROUTES.academics.classSections,
  ROUTES.academics.subjects,
  ROUTES.students.root,
  ROUTES.students.disabled,
  ROUTES.staff.root,
  ROUTES.fees.feeTypes,
  ROUTES.fees.feeGroups,
  ROUTES.fees.discounts,
  ROUTES.fees.assign,
  ROUTES.fees.collect,
  ROUTES.fees.dueSearch,
  ROUTES.fees.paymentSearch,
  ROUTES.attendance.mark,
  ROUTES.attendance.report,
  ROUTES.attendance.approveLeave,
  ROUTES.examinations.groups,
  ROUTES.examinations.exams,
  ROUTES.examinations.schedule,
  ROUTES.settings.general,
  ROUTES.settings.languages,
  ROUTES.settings.currency,
]);

export function isImplementedPath(path: string): boolean {
  return IMPLEMENTED_PATHS.has(path);
}
