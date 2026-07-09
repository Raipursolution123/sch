import { useMemo } from 'react';
import type { Permission } from '@app-types/permissions';
import { getDeniedMessage, ROLE_PERMISSIONS } from '@constants/permissions';
import { useAuthStore } from '@store/index';
import { normalizeRole } from '@utils/normalize-role';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user);

  const permissions = useMemo(() => new Set(ROLE_PERMISSIONS[role]), [role]);

  const can = (permission: Permission) => permissions.has(permission);

  const canAny = (items: Permission[]) => items.some((item) => permissions.has(item));

  const canAll = (items: Permission[]) => items.every((item) => permissions.has(item));

  const reasonIfDenied = (permission: Permission) =>
    can(permission) ? undefined : getDeniedMessage(permission);

  return { role, can, canAny, canAll, reasonIfDenied };
}
