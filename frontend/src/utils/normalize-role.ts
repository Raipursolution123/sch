import type { AppRole } from '@app-types/permissions';
import type { User } from '@app-types/auth';

export function normalizeRole(user: User | null | undefined): AppRole {
  if (!user) return 'guest';
  if (user.is_superadmin) return 'superadmin';

  const role = user.role.toLowerCase();
  if (role.includes('teacher')) return 'teacher';
  if (role.includes('account') || role.includes('finance')) return 'accountant';
  if (role.includes('admin') || role.includes('principal')) return 'admin';

  return 'admin';
}
