import { Outlet, Link } from 'react-router-dom';
import { env } from '@constants/env';
import { ROUTES } from '@constants/index';

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.home} className="text-primary-700 text-xl font-bold">
            {env.appName}
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to={ROUTES.login} className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              to={ROUTES.register}
              className="bg-primary-600 hover:bg-primary-700 rounded-md px-3 py-1.5 text-white"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
