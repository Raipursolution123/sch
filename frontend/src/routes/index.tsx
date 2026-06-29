import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@layouts/MainLayout';
import { AuthLayout } from '@layouts/AuthLayout';
import { DashboardLayout } from '@layouts/DashboardLayout';
import { SettingsLayout } from '@layouts/SettingsLayout';
import { AcademicsLayout } from '@layouts/AcademicsLayout';
import { FeesLayout } from '@layouts/FeesLayout';
import { AttendanceLayout } from '@layouts/AttendanceLayout';
import { ExaminationsLayout } from '@layouts/ExaminationsLayout';
import { HomePage } from '@features/home/pages/HomePage';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { RegisterPage } from '@features/auth/pages/RegisterPage';
import { DashboardPage } from '@features/dashboard/pages/DashboardPage';
import { NotFoundPage } from '@features/errors/pages/NotFoundPage';
import { RouteErrorPage } from '@features/errors/pages/RouteErrorPage';
import { ROUTES } from '@constants/index';

const SessionsPage = lazy(() =>
  import('@features/settings/sessions/pages/SessionsPage').then((m) => ({
    default: m.SessionsPage,
  })),
);

const GeneralSettingsPage = lazy(() =>
  import('@features/settings/general/pages/GeneralSettingsPage').then((m) => ({
    default: m.GeneralSettingsPage,
  })),
);

const LanguagesPage = lazy(() =>
  import('@features/settings/languages/pages/LanguagesPage').then((m) => ({
    default: m.LanguagesPage,
  })),
);

const CurrencyPage = lazy(() =>
  import('@features/settings/currency/pages/CurrencyPage').then((m) => ({
    default: m.CurrencyPage,
  })),
);

const ClassesPage = lazy(() =>
  import('@features/academics/classes/pages/ClassesPage').then((m) => ({
    default: m.ClassesPage,
  })),
);

const SectionsPage = lazy(() =>
  import('@features/academics/sections/pages/SectionsPage').then((m) => ({
    default: m.SectionsPage,
  })),
);

const ClassSectionsPage = lazy(() =>
  import('@features/academics/class-sections/pages/ClassSectionsPage').then((m) => ({
    default: m.ClassSectionsPage,
  })),
);

const SubjectsPage = lazy(() =>
  import('@features/academics/subjects/pages/SubjectsPage').then((m) => ({
    default: m.SubjectsPage,
  })),
);

const StudentsPage = lazy(() =>
  import('@features/students/pages/StudentsPage').then((m) => ({
    default: m.StudentsPage,
  })),
);

const StudentProfilePage = lazy(() =>
  import('@features/students/pages/StudentProfilePage').then((m) => ({
    default: m.StudentProfilePage,
  })),
);

const StaffPage = lazy(() =>
  import('@features/staff/pages/StaffPage').then((m) => ({
    default: m.StaffPage,
  })),
);

const StaffProfilePage = lazy(() =>
  import('@features/staff/pages/StaffProfilePage').then((m) => ({
    default: m.StaffProfilePage,
  })),
);

const FeeTypesPage = lazy(() =>
  import('@features/fees/fee-types/pages/FeeTypesPage').then((m) => ({
    default: m.FeeTypesPage,
  })),
);

const FeeGroupsPage = lazy(() =>
  import('@features/fees/fee-groups/pages/FeeGroupsPage').then((m) => ({
    default: m.FeeGroupsPage,
  })),
);

const FeeAssignPage = lazy(() =>
  import('@features/fees/assign/pages/FeeAssignPage').then((m) => ({
    default: m.FeeAssignPage,
  })),
);

const MarkAttendancePage = lazy(() =>
  import('@features/attendance/mark/pages/MarkAttendancePage').then((m) => ({
    default: m.MarkAttendancePage,
  })),
);

const AttendanceReportPage = lazy(() =>
  import('@features/attendance/report/pages/AttendanceReportPage').then((m) => ({
    default: m.AttendanceReportPage,
  })),
);

const ExamGroupsPage = lazy(() =>
  import('@features/examinations/exam-groups/pages/ExamGroupsPage').then((m) => ({
    default: m.ExamGroupsPage,
  })),
);

const ExamsPage = lazy(() =>
  import('@features/examinations/exams/pages/ExamsPage').then((m) => ({
    default: m.ExamsPage,
  })),
);

const ExamSchedulePage = lazy(() =>
  import('@features/examinations/schedule/pages/ExamSchedulePage').then((m) => ({
    default: m.ExamSchedulePage,
  })),
);

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
    ],
  },
  {
    element: <DashboardLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      {
        path: ROUTES.settings.root,
        element: <SettingsLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.settings.sessions} replace /> },
          { path: 'sessions', element: <SessionsPage /> },
          { path: 'general', element: <GeneralSettingsPage /> },
          { path: 'languages', element: <LanguagesPage /> },
          { path: 'currency', element: <CurrencyPage /> },
        ],
      },
      {
        path: ROUTES.academics.root,
        element: <AcademicsLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.academics.classes} replace /> },
          { path: 'classes', element: <ClassesPage /> },
          { path: 'sections', element: <SectionsPage /> },
          { path: 'class-sections', element: <ClassSectionsPage /> },
          { path: 'subjects', element: <SubjectsPage /> },
        ],
      },
      { path: ROUTES.students.root, element: <StudentsPage /> },
      { path: `${ROUTES.students.root}/:studentId`, element: <StudentProfilePage /> },
      { path: ROUTES.staff.root, element: <StaffPage /> },
      { path: `${ROUTES.staff.root}/:staffId`, element: <StaffProfilePage /> },
      {
        path: ROUTES.fees.root,
        element: <FeesLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.fees.feeTypes} replace /> },
          { path: 'fee-types', element: <FeeTypesPage /> },
          { path: 'fee-groups', element: <FeeGroupsPage /> },
          { path: 'assign', element: <FeeAssignPage /> },
        ],
      },
      {
        path: ROUTES.attendance.root,
        element: <AttendanceLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.attendance.mark} replace /> },
          { path: 'mark', element: <MarkAttendancePage /> },
          { path: 'report', element: <AttendanceReportPage /> },
        ],
      },
      {
        path: ROUTES.examinations.root,
        element: <ExaminationsLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.examinations.groups} replace /> },
          { path: 'groups', element: <ExamGroupsPage /> },
          { path: 'exams', element: <ExamsPage /> },
          { path: 'schedule', element: <ExamSchedulePage /> },
        ],
      },
    ],
  },
  { path: ROUTES.notFound, element: <NotFoundPage /> },
]);
