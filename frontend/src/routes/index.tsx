import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@layouts/MainLayout';
import { AuthLayout } from '@layouts/AuthLayout';
import { DashboardLayout } from '@layouts/DashboardLayout';
import { HomePage } from '@features/home/pages/HomePage';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { RegisterPage } from '@features/auth/pages/RegisterPage';
import { NotFoundPage } from '@features/errors/pages/NotFoundPage';
import { RouteErrorPage } from '@features/errors/pages/RouteErrorPage';
import { ROUTES } from '@constants/routes';
import { adminRoutes } from '@routes/admin-routes';
import { Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [{ path: ROUTES.home, element: <HomePage /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
      { path: '/admin/login', element: <Navigate to={ROUTES.login} replace /> },
    ],
  },
  {
    element: <DashboardLayout />,
    errorElement: <RouteErrorPage />,
    children: adminRoutes,
  },
  { path: ROUTES.notFound, element: <NotFoundPage /> },
]);
