import { useMemo } from 'react';
import { ADMIN_NAV, filterNavigationTree } from '@constants/navigation';
import type { NavItem } from '@app-types/navigation';
import { ROLE_PERMISSIONS } from '@constants/permissions';
import {
  createNavigationPermissionChecker,
  createPermissiveChecker,
} from '@services/navigation/permission-resolver';
import { useAuthStore } from '@store/index';
import { normalizeRole } from '@utils/normalize-role';

/**
 * Returns permission-filtered navigation.
 * Uses permissive checker for superadmin until backend supplies legacy permission keys.
 */
export function useFilteredNav(): NavItem[] {
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user);
  const legacyKeys = user?.permissions ?? [];

  return useMemo(() => {
    if (role === 'superadmin' || role === 'admin') {
      return filterNavigationTree(ADMIN_NAV, createPermissiveChecker());
    }

    const checker = createNavigationPermissionChecker({
      legacyKeys: new Set(legacyKeys),
      uiKeys: new Set(ROLE_PERMISSIONS[role]),
    });

    return filterNavigationTree(ADMIN_NAV, checker);
  }, [role, legacyKeys]);
}
