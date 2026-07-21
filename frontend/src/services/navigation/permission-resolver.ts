import type { NavPermissionKey } from '@app-types/navigation';
import type { Permission } from '@app-types/permissions';

/**
 * Maps modern UI permission keys to legacy permission_category keys.
 * Replace this map when backend exposes permissions directly from `/me`.
 */
export const PERMISSION_TO_LEGACY: Partial<Record<Permission, NavPermissionKey[]>> = {
  'students.view': ['student', 'student_report'],
  'students.create': ['student', 'import_student'],
  'students.delete': ['student', 'disable_student'],
  'staff.view': ['staff', 'staff_report'],
  'staff.create': ['staff'],
  'staff.edit': ['staff'],
  'staff.delete': ['staff'],
  'settings.manage': [
    'general_setting',
    'session_setting',
    'languages',
    'currency',
    'roles',
    'user_status',
  ],
  'general_settings.view': ['general_setting'],
  'general_settings.edit': ['general_setting'],
  'academics.manage': [
    'class',
    'section',
    'subject',
    'subject_group',
    'class_timetable',
    'teachers_time_table',
    'assign_class_teacher',
    'promote_student',
    'session_setting',
  ],
  'classes.view': ['class'],
  'classes.create': ['class'],
  'classes.edit': ['class'],
  'classes.delete': ['class'],
  'sections.view': ['section'],
  'sections.create': ['section'],
  'sections.edit': ['section'],
  'sections.delete': ['section'],
  'subjects.view': ['subject'],
  'subjects.create': ['subject'],
  'subjects.edit': ['subject'],
  'subjects.delete': ['subject'],
  'subject_groups.view': ['subject_group'],
  'subject_groups.create': ['subject_group'],
  'subject_groups.edit': ['subject_group'],
  'subject_groups.delete': ['subject_group'],
  'timetable.view': ['class_timetable'],
  'timetable.create': ['class_timetable'],
  'timetable.edit': ['class_timetable'],
  'timetable.delete': ['class_timetable'],
  'teacher_timetable.view': ['teachers_time_table'],
  'class_teacher.view': ['assign_class_teacher'],
  'class_teacher.create': ['assign_class_teacher'],
  'class_teacher.edit': ['assign_class_teacher'],
  'class_teacher.delete': ['assign_class_teacher'],
  'promote_students.view': ['promote_student'],
  'promote_students.create': ['promote_student'],
  'sessions.view': ['session_setting'],
  'sessions.create': ['session_setting'],
  'sessions.edit': ['session_setting'],
  'sessions.delete': ['session_setting'],
  'fees.manage': [
    'collect_fees',
    'fees_master',
    'feetype',
    'fees_group',
    'fees_discount',
    'fees_forward',
    'search_due_fees',
    'search_fees_payment',
    'offline_bank_payments',
  ],
  'attendance.mark': ['student_attendance', 'subject_attendance'],
  'attendance.report': ['student_attendance', 'attendance_report'],
  'exams.view': ['exam_group', 'exam_schedule', 'exam_result'],
  'exams.create': ['exam_group', 'exam_schedule', 'exam_result'],
  'exams.edit': ['exam_group', 'exam_schedule', 'exam_result'],
  'exams.delete': ['exam_group', 'exam_schedule'],
  'exams.submit': ['exam_result'],
  'exams.approve': ['exam_result'],
  'notifications.view': ['notice_board', 'email_sms'],
  'transport.create': [
    'routes',
    'transport_fees_master',
    'pickup_point',
    'route_pickup_point',
    'vehicle',
    'assign_vehicle',
  ],
  'transport.edit': [
    'routes',
    'transport_fees_master',
    'pickup_point',
    'route_pickup_point',
    'vehicle',
    'assign_vehicle',
  ],
  'transport.delete': [
    'routes',
    'transport_fees_master',
    'pickup_point',
    'route_pickup_point',
    'vehicle',
    'assign_vehicle',
  ],
  'manage_syllabus_status.view': ['manage_syllabus_status'],
  'manage_syllabus_status.create': ['manage_syllabus_status'],
  'manage_syllabus_status.edit': ['manage_syllabus_status'],
  'manage_syllabus_status.delete': ['manage_syllabus_status'],
  'manage_lesson.view': ['lesson_plan', 'manage_lesson'],
  'manage_lesson.create': ['lesson_plan', 'manage_lesson'],
  'manage_lesson.edit': ['lesson_plan', 'manage_lesson'],
  'manage_lesson.delete': ['lesson_plan', 'manage_lesson'],
  'manage_topic.view': ['lesson_plan', 'manage_topic'],
  'manage_topic.create': ['lesson_plan', 'manage_topic'],
  'manage_topic.edit': ['lesson_plan', 'manage_topic'],
  'manage_topic.delete': ['lesson_plan', 'manage_topic'],
  'homework.view': ['homework'],
  'homework.create': ['homework'],
  'homework.edit': ['homework'],
  'homework.delete': ['homework'],
  'daily_assignment.view': ['daily_assignment'],
  'daily_assignment.create': ['daily_assignment'],
  'daily_assignment.edit': ['daily_assignment'],
  'daily_assignment.delete': ['daily_assignment'],
  'finance.entries.view': ['entries'],
  'finance.entries.create': ['entries'],
  'finance.entries.delete': ['entries'],
  'finance.accounts.manage': ['accounts'],
  'library.books.view': ['books'],
  'library.books.create': ['books'],
  'library.books.edit': ['books'],
  'library.books.delete': ['books'],
  'library.issue.view': ['issue_return'],
};

export interface NavigationPermissionContext {
  /** Legacy permission_category keys from backend (future: from auth store). */
  legacyKeys: ReadonlySet<NavPermissionKey>;
  /** Modern UI permission keys (current static role map). */
  uiKeys: ReadonlySet<Permission>;
}

export interface NavigationPermissionChecker {
  canAccessNavItem(permissionKeys?: NavPermissionKey[], requireAll?: boolean): boolean;
}

export function createNavigationPermissionChecker(
  context: NavigationPermissionContext,
): NavigationPermissionChecker {
  const expandedUiLegacyKeys = new Set<NavPermissionKey>(context.legacyKeys);

  for (const uiKey of context.uiKeys) {
    const mapped = PERMISSION_TO_LEGACY[uiKey];
    mapped?.forEach((key) => expandedUiLegacyKeys.add(key));
  }

  return {
    canAccessNavItem(permissionKeys, requireAll = false) {
      if (!permissionKeys?.length) return true;

      if (requireAll) {
        return permissionKeys.every((key) => expandedUiLegacyKeys.has(key));
      }

      return permissionKeys.some((key) => expandedUiLegacyKeys.has(key));
    },
  };
}

/** Superadmin bypass — all navigation visible until backend wiring is complete. */
export function createPermissiveChecker(): NavigationPermissionChecker {
  return {
    canAccessNavItem() {
      return true;
    },
  };
}
