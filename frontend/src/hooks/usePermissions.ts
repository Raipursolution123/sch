import { useMemo } from 'react';
import type { LegacyPermissionActions } from '@app-types/auth';
import type { Permission } from '@app-types/permissions';
import { getDeniedMessage, ROLE_PERMISSIONS } from '@constants/permissions';
import { useAuthStore } from '@store/index';
import { legacyPermissionAllows } from '@utils/legacy-permissions';
import { normalizeRole } from '@utils/normalize-role';

function hasLegacyPermissions(
  legacyPermissions: Record<string, LegacyPermissionActions> | undefined,
): boolean {
  return Boolean(legacyPermissions && Object.keys(legacyPermissions).length > 0);
}

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user);
  const legacyPermissions = user?.legacy_permissions;

  const fallbackPermissions = useMemo(() => new Set(ROLE_PERMISSIONS[role]), [role]);

  const can = (permission: Permission) => {
    if (user?.is_superadmin) return true;
    if (hasLegacyPermissions(legacyPermissions)) {
      return legacyPermissionAllows(legacyPermissions, permission);
    }
    return fallbackPermissions.has(permission);
  };

  const canAny = (items: Permission[]) => items.some((item) => can(item));

  const canAll = (items: Permission[]) => items.every((item) => can(item));

  const reasonIfDenied = (permission: Permission) =>
    can(permission) ? undefined : getDeniedMessage(permission);

  return { role, can, canAny, canAll, reasonIfDenied };
}
