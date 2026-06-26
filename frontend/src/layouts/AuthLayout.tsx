import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/index';
import { ROUTES } from '@constants/index';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
