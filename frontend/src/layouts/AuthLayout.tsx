import { Outlet, Navigate } from 'react-router-dom';
import { BrandMark } from '@components/brand/BrandMark';
import { useAuthStore } from '@store/index';
import { ROUTES } from '@constants/index';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas-soft p-4">
      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-card focus:px-4 focus:py-2 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to form
      </a>
      <BrandMark to={ROUTES.home} className="mb-6" />
      <div id="auth-main" tabIndex={-1} className="w-full max-w-md outline-none">
        <Outlet />
      </div>
    </div>
  );
}
