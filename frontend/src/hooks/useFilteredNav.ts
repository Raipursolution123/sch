import { useMemo } from 'react';
import {
  ADMIN_NAV,
  filterNavigationTree,
  annotateNavImplementationStatus,
} from '@constants/navigation';
import type { NavItem } from '@app-types/navigation';
import { ROLE_PERMISSIONS } from '@constants/permissions';
import {
  createNavigationPermissionChecker,
  createPermissiveChecker,
} from '@services/navigation/permission-resolver';
import { useAuthStore } from '@store/index';
import { legacyViewableCategories } from '@utils/legacy-permissions';
import { normalizeRole } from '@utils/normalize-role';

/**
 * Returns permission-filtered navigation using backend legacy_permissions when available.
 */
export function useFilteredNav(): NavItem[] {
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user);
  const legacyPermissions = user?.legacy_permissions;

  return useMemo(() => {
    if (user?.is_superadmin) {
      return annotateNavImplementationStatus(
        filterNavigationTree(ADMIN_NAV, createPermissiveChecker()),
      );
    }

    const legacyKeys =
      legacyPermissions && Object.keys(legacyPermissions).length > 0
        ? legacyViewableCategories(legacyPermissions)
        : (user?.permissions ?? []);

    const checker = createNavigationPermissionChecker({
      legacyKeys: new Set(legacyKeys),
      uiKeys: new Set(ROLE_PERMISSIONS[role]),
    });

    return annotateNavImplementationStatus(filterNavigationTree(ADMIN_NAV, checker));
  }, [user?.is_superadmin, user?.permissions, legacyPermissions, role]);
}
