import type { NavItem } from '@app-types/navigation';
import type { NavigationPermissionChecker } from '@services/navigation/permission-resolver';
import { isImplementedPath } from '@routes/implemented-paths';

function annotateComingSoon(item: NavItem): NavItem {
  const children = item.children?.map(annotateComingSoon);
  return {
    ...item,
    comingSoon: item.path ? !isImplementedPath(item.path) : false,
    children,
  };
}

/** Marks nav leaves that route to Coming Soon placeholders. */
export function annotateNavImplementationStatus(items: NavItem[]): NavItem[] {
  return items.map(annotateComingSoon);
}

/**
 * Removes unimplemented (Coming Soon) leaves and empty groups so the sidebar
 * only surfaces production-ready destinations.
 */
export function pruneUnimplementedNav(items: NavItem[]): NavItem[] {
  const pruned: NavItem[] = [];

  for (const item of items) {
    const children = item.children ? pruneUnimplementedNav(item.children) : undefined;
    const hasChildren = Boolean(children?.length);
    const selfReady = Boolean(item.path && !item.comingSoon && !item.disabled);

    if (!selfReady && !hasChildren) continue;

    pruned.push({
      ...item,
      children,
      path: selfReady ? item.path : hasChildren ? undefined : item.path,
      comingSoon: false,
    });
  }

  return pruned;
}

function filterNavItem(item: NavItem, checker: NavigationPermissionChecker): NavItem | null {
  if (item.disabled) return null;

  const filteredChildren = item.children
    ?.map((child) => filterNavItem(child, checker))
    .filter((child): child is NavItem => child !== null);

  const hasAccessibleChildren = Boolean(filteredChildren?.length);
  const selfAllowed = checker.canAccessNavItem(item.permissionKeys, item.requireAllPermissions);

  if (!selfAllowed && !hasAccessibleChildren) return null;

  return {
    ...item,
    children: filteredChildren,
  };
}

/** Returns navigation tree filtered by permission checker (backend-pluggable). */
export function filterNavigationTree(
  items: NavItem[],
  checker: NavigationPermissionChecker,
): NavItem[] {
  return items
    .map((item) => filterNavItem(item, checker))
    .filter((item): item is NavItem => item !== null);
}

/** Flattens navigation for module switcher and breadcrumbs. */
export function flattenNavigation(items: NavItem[], group?: string): FlatNavRoute[] {
  const routes: FlatNavRoute[] = [];

  for (const item of items) {
    if (item.path && !item.disabled && !item.comingSoon) {
      routes.push({
        id: item.id,
        label: item.label,
        path: item.path,
        section: item.section,
        group,
      });
    }

    if (item.children?.length) {
      routes.push(...flattenNavigation(item.children, item.label));
    }
  }

  return routes;
}

export interface FlatNavRoute {
  id: string;
  label: string;
  path: string;
  section?: string;
  group?: string;
}

/** Collect all leaf and parent paths for route matching. */
export function collectNavPaths(items: NavItem[]): string[] {
  const paths: string[] = [];

  for (const item of items) {
    if (item.path) paths.push(item.path);
    if (item.children?.length) {
      paths.push(...collectNavPaths(item.children));
    }
  }

  return paths;
}
