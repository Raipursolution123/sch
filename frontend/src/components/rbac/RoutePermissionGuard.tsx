import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ForbiddenPage } from '@features/errors/pages/ForbiddenPage';
import { ROUTES } from '@constants/routes';
import { getRoutePermissionKeys } from '@constants/route-permissions';
import { useAuthStore } from '@store/index';
import { legacyViewableCategories } from '@utils/legacy-permissions';

/**
 * Blocks direct URL access when the user lacks legacy nav permissions for the route.
 * Superadmin bypass; routes without mapped permission keys are allowed.
 */
export function RoutePermissionGuard() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.is_superadmin) {
    return <Outlet />;
  }

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === ROUTES.dashboard) {
    return <Outlet />;
  }

  const requiredKeys = getRoutePermissionKeys(location.pathname);
  if (!requiredKeys?.length) {
    return <Outlet />;
  }

  const viewable = new Set(legacyViewableCategories(user.legacy_permissions));
  const allowed = requiredKeys.some((key) => viewable.has(key));

  if (!allowed) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}
