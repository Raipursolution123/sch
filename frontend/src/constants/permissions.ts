import type { AppRole, Permission } from '@app-types/permissions';

const ALL_PERMISSIONS: Permission[] = [
  'students.view',
  'students.create',
  'students.delete',
  'staff.view',
  'staff.create',
  'staff.edit',
  'staff.delete',
  'settings.manage',
  'general_settings.view',
  'general_settings.edit',
  'academics.manage',
  'sessions.view',
  'sessions.create',
  'sessions.edit',
  'sessions.delete',
  'exams.view',
  'exams.create',
  'exams.edit',
  'exams.delete',
  'exams.submit',
  'exams.approve',
  'fees.manage',
  'attendance.mark',
  'attendance.report',
  'notifications.view',
];

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  superadmin: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  teacher: [
    'students.view',
    'staff.view',
    'exams.view',
    'exams.create',
    'exams.edit',
    'exams.submit',
    'attendance.mark',
    'attendance.report',
    'notifications.view',
  ],
  accountant: [
    'students.view',
    'staff.view',
    'fees.manage',
    'attendance.report',
    'notifications.view',
  ],
  guest: [],
};

export const PERMISSION_DENIED_MESSAGES: Partial<Record<Permission, string>> = {
  'students.delete': 'You do not have permission to delete students.',
  'students.create': 'You do not have permission to admit students.',
  'staff.create': 'You do not have permission to add staff.',
  'staff.edit': 'You do not have permission to edit staff.',
  'staff.delete': 'You do not have permission to delete staff.',
  'settings.manage': 'Only administrators can change school settings.',
  'general_settings.edit': 'You do not have permission to edit general settings.',
  'academics.manage': 'You do not have permission to manage academic structure.',
  'sessions.create': 'You do not have permission to create academic sessions.',
  'sessions.edit': 'You do not have permission to edit academic sessions.',
  'sessions.delete': 'You do not have permission to delete academic sessions.',
  'exams.create': 'You do not have permission to create exams.',
  'exams.edit': 'You do not have permission to edit exams.',
  'exams.delete': 'You do not have permission to delete exams.',
  'exams.submit': 'You cannot submit exams for publication.',
  'exams.approve': 'Only principals or admins can approve exam publication.',
  'fees.manage': 'You do not have permission to manage fees.',
  'attendance.mark': 'You do not have permission to mark attendance.',
};

export function getDeniedMessage(permission: Permission): string {
  return PERMISSION_DENIED_MESSAGES[permission] ?? 'You do not have permission for this action.';
}
