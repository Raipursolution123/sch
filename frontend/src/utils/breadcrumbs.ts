import { ADMIN_NAV, flattenNavigation } from '@constants/navigation';
import { ROUTES } from '@constants/routes';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface FlatNavRoute {
  id: string;
  label: string;
  path: string;
  section?: string;
  group?: string;
}

export function getFlatNavRoutes(): FlatNavRoute[] {
  return flattenNavigation(ADMIN_NAV);
}

const DETAIL_BREADCRUMBS: {
  pattern: RegExp;
  parents: BreadcrumbItem[];
  current: string;
}[] = [
  {
    pattern: /^\/students\/\d+/,
    parents: [{ label: 'Students', href: ROUTES.students.root }],
    current: 'Student profile',
  },
  {
    pattern: /^\/staff\/\d+/,
    parents: [{ label: 'Staff', href: ROUTES.staff.root }],
    current: 'Staff profile',
  },
];

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: 'Dashboard', href: ROUTES.dashboard }];

  if (pathname === ROUTES.dashboard || pathname === '/') {
    return crumbs;
  }

  for (const detail of DETAIL_BREADCRUMBS) {
    if (detail.pattern.test(pathname)) {
      return [...crumbs, ...detail.parents, { label: detail.current }];
    }
  }

  const routes = getFlatNavRoutes().sort((a, b) => b.path.length - a.path.length);
  const match = routes.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`),
  );

  if (!match) {
    return crumbs;
  }

  if (match.group) {
    const parent = routes.find((route) => route.label === match.group && !route.group);
    if (parent) {
      crumbs.push({ label: parent.label, href: parent.path });
    }
  }

  crumbs.push({ label: match.label, href: match.path });
  return crumbs;
}
