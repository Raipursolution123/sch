import { Navigate } from 'react-router-dom';
import { AppShell } from '@components/layout/AppShell';
import { RoutePermissionGuard } from '@components/rbac/RoutePermissionGuard';
import { useAuthBootstrap } from '@hooks/useAuthBootstrap';
import { useAuthStore } from '@store/index';
import { ROUTES } from '@constants/index';

export function DashboardLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useAuthBootstrap();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <AppShell>
      <RoutePermissionGuard />
    </AppShell>
  );
}
