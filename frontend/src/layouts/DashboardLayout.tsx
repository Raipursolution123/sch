import { Outlet, Navigate } from 'react-router-dom';
import { AdminSidebar } from '@components/layout/AdminSidebar';
import { TopBar } from '@components/layout/TopBar';
import { useAuthStore } from '@store/index';
import { ROUTES } from '@constants/index';

export function DashboardLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
