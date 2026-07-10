/** Application roles — mapped from auth user.role / is_superadmin. */
export type AppRole = 'superadmin' | 'admin' | 'teacher' | 'accountant' | 'guest';

/** Fine-grained permissions for UI gating (backend enforcement is separate). */
export type Permission =
  | 'students.view'
  | 'students.create'
  | 'students.delete'
  | 'staff.view'
  | 'staff.create'
  | 'staff.edit'
  | 'staff.delete'
  | 'settings.manage'
  | 'academics.manage'
  | 'sessions.view'
  | 'sessions.create'
  | 'sessions.edit'
  | 'sessions.delete'
  | 'exams.view'
  | 'exams.create'
  | 'exams.edit'
  | 'exams.delete'
  | 'exams.submit'
  | 'exams.approve'
  | 'fees.manage'
  | 'attendance.mark'
  | 'attendance.report'
  | 'notifications.view';
