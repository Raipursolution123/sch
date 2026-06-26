import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@layouts/MainLayout';
import { AuthLayout } from '@layouts/AuthLayout';
import { DashboardLayout } from '@layouts/DashboardLayout';
import { HomePage } from '@features/home/pages/HomePage';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { RegisterPage } from '@features/auth/pages/RegisterPage';
import { DashboardPage } from '@features/dashboard/pages/DashboardPage';
import { NotFoundPage } from '@features/errors/pages/NotFoundPage';
import { ROUTES } from '@constants/index';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },
    ],
  },
  { path: ROUTES.notFound, element: <NotFoundPage /> },
]);
