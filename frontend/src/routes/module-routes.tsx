import { Navigate, type RouteObject } from 'react-router-dom';
import { ComingSoonPage } from '@features/foundation/pages/ComingSoonPage';
import { ADMIN_NAV, flattenNavigation } from '@constants/navigation';
import { IMPLEMENTED_PATHS } from '@routes/implemented-paths';
import { ModuleLayout } from '@layouts/ModuleLayout';

function modulePathToSegment(moduleRoot: string): string {
  return moduleRoot.replace(/^\//, '');
}

/** Builds Coming Soon child routes for a module from the navigation map. */
export function buildPlaceholderChildren(moduleRoot: string): RouteObject[] {
  const flat = flattenNavigation(ADMIN_NAV);

  return flat
    .filter((route) => {
      if (route.path === moduleRoot) return false;
      if (!route.path.startsWith(`${moduleRoot}/`)) return false;
      if (IMPLEMENTED_PATHS.has(route.path)) return false;
      return true;
    })
    .map((route) => ({
      path: route.path.slice(moduleRoot.length + 1),
      element: <ComingSoonPage />,
      handle: {
        page: {
          title: route.label,
          description: `Manage ${route.label.toLowerCase()} using the same legacy business rules, with a modern interface.`,
          module: route.group,
        },
      },
    }));
}

export function createModuleRoutes(
  moduleRoot: string,
  defaultPath: string,
  implementedRoutes: RouteObject[] = [],
): RouteObject {
  return {
    path: modulePathToSegment(moduleRoot),
    element: <ModuleLayout />,
    children: [
      { index: true, element: <Navigate to={defaultPath} replace /> },
      ...implementedRoutes,
      ...buildPlaceholderChildren(moduleRoot),
    ],
  };
}

/** Module where every screen is still a placeholder. */
export function createPlaceholderModule(moduleRoot: string, defaultPath: string): RouteObject {
  return createModuleRoutes(moduleRoot, defaultPath, []);
}
