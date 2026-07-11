import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ROUTES, LEGACY_SETTINGS_SESSIONS } from '@constants/routes';
import { ModuleLayout } from '@layouts/ModuleLayout';
import { DashboardPage } from '@features/dashboard/pages/DashboardPage';
import {
  buildPlaceholderChildren,
  createModuleRoutes,
  createPlaceholderModule,
} from '@routes/module-routes';

const SessionsPage = lazy(() =>
  import('@features/academics/sessions/pages/SessionsPage').then((m) => ({
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

const SubjectGroupsPage = lazy(() =>
  import('@features/academics/subject-groups/pages/SubjectGroupsPage').then((m) => ({
    default: m.SubjectGroupsPage,
  })),
);

const TimetablePage = lazy(() =>
  import('@features/academics/timetable/pages/TimetablePage').then((m) => ({
    default: m.TimetablePage,
  })),
);

const TeacherTimetablePage = lazy(() =>
  import('@features/academics/teacher-timetable/pages/TeacherTimetablePage').then((m) => ({
    default: m.TeacherTimetablePage,
  })),
);

const ClassTeacherPage = lazy(() =>
  import('@features/academics/class-teacher/pages/ClassTeacherPage').then((m) => ({
    default: m.ClassTeacherPage,
  })),
);

const PromoteStudentsPage = lazy(() =>
  import('@features/academics/promote/pages/PromoteStudentsPage').then((m) => ({
    default: m.PromoteStudentsPage,
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

const ApproveLeavePage = lazy(() =>
  import('@features/attendance/approve-leave/pages/ApproveLeavePage').then((m) => ({
    default: m.ApproveLeavePage,
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

/** Authenticated admin routes mounted under DashboardLayout. */
export const adminRoutes: RouteObject[] = [
  { path: 'dashboard', element: <DashboardPage /> },

  {
    path: LEGACY_SETTINGS_SESSIONS.slice(1),
    element: <Navigate to={ROUTES.academics.sessions} replace />,
  },

  createModuleRoutes('/academics', ROUTES.academics.sessions, [
    { path: 'sessions', element: <SessionsPage /> },
    { path: 'classes', element: <ClassesPage /> },
    { path: 'sections', element: <SectionsPage /> },
    { path: 'class-sections', element: <ClassSectionsPage /> },
    { path: 'subjects', element: <SubjectsPage /> },
    { path: 'subject-groups', element: <SubjectGroupsPage /> },
    { path: 'timetable', element: <TimetablePage /> },
    { path: 'teacher-timetable', element: <TeacherTimetablePage /> },
    { path: 'class-teacher', element: <ClassTeacherPage /> },
    { path: 'promote', element: <PromoteStudentsPage /> },
  ]),

  {
    path: 'students',
    element: <ModuleLayout />,
    children: [
      { index: true, element: <StudentsPage /> },
      { path: ':studentId', element: <StudentProfilePage /> },
      ...buildPlaceholderChildren('/students'),
    ],
  },

  {
    path: 'staff',
    element: <ModuleLayout />,
    children: [
      { index: true, element: <StaffPage /> },
      { path: ':staffId', element: <StaffProfilePage /> },
      ...buildPlaceholderChildren('/staff'),
    ],
  },

  createModuleRoutes('/attendance', ROUTES.attendance.mark, [
    { path: 'mark', element: <MarkAttendancePage /> },
    { path: 'report', element: <AttendanceReportPage /> },
    { path: 'approve-leave', element: <ApproveLeavePage /> },
  ]),

  createModuleRoutes('/fees', ROUTES.fees.feeTypes, [
    { path: 'fee-types', element: <FeeTypesPage /> },
    { path: 'fee-groups', element: <FeeGroupsPage /> },
    { path: 'assign', element: <FeeAssignPage /> },
  ]),

  createModuleRoutes('/examinations', ROUTES.examinations.groups, [
    { path: 'groups', element: <ExamGroupsPage /> },
    { path: 'exams', element: <ExamsPage /> },
    { path: 'schedule', element: <ExamSchedulePage /> },
  ]),

  createModuleRoutes('/settings', ROUTES.settings.general, [
    { path: 'general', element: <GeneralSettingsPage /> },
    { path: 'languages', element: <LanguagesPage /> },
    { path: 'currency', element: <CurrencyPage /> },
  ]),

  createPlaceholderModule('/front-office', ROUTES.frontOffice.enquiry),
  createPlaceholderModule('/library', ROUTES.library.books),
  createPlaceholderModule('/transport', ROUTES.transport.fees),
  createPlaceholderModule('/hostel', ROUTES.hostel.rooms),
  createPlaceholderModule('/inventory', ROUTES.inventory.issue),
  createPlaceholderModule('/homework', ROUTES.homework.assignments),
  createPlaceholderModule('/communicate', ROUTES.communicate.notices),
  createPlaceholderModule('/download-center', ROUTES.downloadCenter.contentTypes),
  createPlaceholderModule('/lesson-plan', ROUTES.lessonPlan.syllabusStatus),
  createPlaceholderModule('/online-examinations', ROUTES.onlineExams.exams),
  createPlaceholderModule('/income', ROUTES.income.list),
  createPlaceholderModule('/expense', ROUTES.expense.list),
  createPlaceholderModule('/finance', ROUTES.finance.chartOfAccounts),
  createPlaceholderModule('/reports', ROUTES.reports.students),
  createPlaceholderModule('/certificates', ROUTES.certificates.templates),
  createPlaceholderModule('/alumni', ROUTES.alumni.list),
  createPlaceholderModule('/leads', ROUTES.leads.all),
  createPlaceholderModule('/cms', ROUTES.cms.events),
];
