import type { NavItem, NavPermissionKey } from '@app-types/navigation';
import { ADMIN_NAV } from '@constants/navigation';

function collectRoutePermissions(items: NavItem[], map: Map<string, NavPermissionKey[]>): void {
  for (const item of items) {
    if (item.path && item.permissionKeys?.length) {
      map.set(item.path, item.permissionKeys);
    }
    if (item.children?.length) {
      collectRoutePermissions(item.children, map);
    }
  }
}

/** Path → legacy permission_category keys required for route access. */
export const ROUTE_PERMISSIONS = (() => {
  const map = new Map<string, NavPermissionKey[]>();
  collectRoutePermissions(ADMIN_NAV, map);
  return map;
})();

/** Resolve permission keys for a pathname (exact match, then parent prefix). */
export function getRoutePermissionKeys(pathname: string): NavPermissionKey[] | undefined {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (ROUTE_PERMISSIONS.has(normalized)) {
    return ROUTE_PERMISSIONS.get(normalized);
  }

  const segments = normalized.split('/').filter(Boolean);
  while (segments.length > 1) {
    segments.pop();
    const parent = `/${segments.join('/')}`;
    if (ROUTE_PERMISSIONS.has(parent)) {
      return ROUTE_PERMISSIONS.get(parent);
    }
  }

  return undefined;
}
