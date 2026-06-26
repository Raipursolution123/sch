import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '@store/index';
import { ROUTES } from '@constants/index';
import { env } from '@constants/env';

export function DashboardLayout() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.dashboard} className="text-xl font-bold text-primary-700">
            {env.appName}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.username || user?.role}</span>
            <button
              type="button"
              onClick={() => clearAuth()}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
