import { Outlet, Navigate } from 'react-router-dom';
import { AppShell } from '@components/layout/AppShell';
import { useAuthStore } from '@store/index';
import { ROUTES } from '@constants/index';

export function DashboardLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
