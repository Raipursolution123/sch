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

// Finance
const LedgersPage = lazy(() =>
  import('@features/finance/ledgers/pages/LedgersPage').then((m) => ({
    default: m.LedgersPage,
  })),
);

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

const LessonPage = lazy(() =>
  import('@features/academics/lessons/pages/LessonPage').then((m) => ({
    default: m.LessonPage,
  })),
);

const SyllabusStatusPage = lazy(() =>
  import('@features/academics/syllabus-status/pages/SyllabusStatusPage').then((m) => ({
    default: m.SyllabusStatusPage,
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

const DisabledStudentsPage = lazy(() =>
  import('@features/students/pages/DisabledStudentsPage').then((m) => ({
    default: m.DisabledStudentsPage,
  })),
);

const StaffPage = lazy(() =>
  import('@features/staff/pages/StaffPage').then((m) => ({
    default: m.StaffPage,
  })),
);

const LeaveTypesPage = lazy(() =>
  import('@features/staff/leave-types/pages/LeaveTypesPage').then((m) => ({
    default: m.LeaveTypesPage,
  })),
);

const StaffLeaveRequestsPage = lazy(() =>
  import('@features/staff/leave-requests/pages/StaffLeaveRequestsPage').then((m) => ({
    default: m.StaffLeaveRequestsPage,
  })),
);

const StaffLeaveAllotmentsPage = lazy(() =>
  import('@features/staff/leave-allotments/pages/StaffLeaveAllotmentsPage').then((m) => ({
    default: m.StaffLeaveAllotmentsPage,
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

const FeeDiscountsPage = lazy(() =>
  import('@features/fees/discounts/pages/FeeDiscountsPage').then((m) => ({
    default: m.FeeDiscountsPage,
  })),
);

const AssignDiscountsPage = lazy(() =>
  import('@features/fees/discounts/pages/AssignDiscountsPage').then((m) => ({
    default: m.AssignDiscountsPage,
  })),
);

const FeeAssignPage = lazy(() =>
  import('@features/fees/assign/pages/FeeAssignPage').then((m) => ({
    default: m.FeeAssignPage,
  })),
);

const CollectFeesPage = lazy(() =>
  import('@features/fees/collect/pages/CollectFeesPage').then((m) => ({
    default: m.CollectFeesPage,
  })),
);

const DueFeesSearchPage = lazy(() =>
  import('@features/fees/due-search/pages/DueFeesSearchPage').then((m) => ({
    default: m.DueFeesSearchPage,
  })),
);

const PaymentSearchPage = lazy(() =>
  import('@features/fees/payment-search/pages/PaymentSearchPage').then((m) => ({
    default: m.PaymentSearchPage,
  })),
);

const FeeRemindersPage = lazy(() =>
  import('@features/fees/reminders/pages/FeeRemindersPage').then((m) => ({
    default: m.FeeRemindersPage,
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

const GradesPage = lazy(() =>
  import('@features/examinations/grades/pages/GradesPage').then((m) => ({
    default: m.GradesPage,
  })),
);

const MarkDivisionsPage = lazy(() =>
  import('@features/examinations/divisions/pages/MarkDivisionsPage').then((m) => ({
    default: m.MarkDivisionsPage,
  })),
);

const ExamResultsPage = lazy(() =>
  import('@features/examinations/results/pages/ExamResultsPage').then((m) => ({
    default: m.ExamResultsPage,
  })),
);

const ExamEnrollPage = lazy(() =>
  import('@features/examinations/enroll/pages/ExamEnrollPage').then((m) => ({
    default: m.ExamEnrollPage,
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
      { path: 'disabled', element: <DisabledStudentsPage /> },
      { path: ':studentId', element: <StudentProfilePage /> },
      ...buildPlaceholderChildren('/students'),
    ],
  },

  {
    path: 'staff',
    element: <ModuleLayout />,
    children: [
      { index: true, element: <StaffPage /> },
      { path: 'leave-types', element: <LeaveTypesPage /> },
      { path: 'leave', element: <StaffLeaveRequestsPage /> },
      { path: 'leave-allotments', element: <StaffLeaveAllotmentsPage /> },
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
    { path: 'collect', element: <CollectFeesPage /> },
    { path: 'due-search', element: <DueFeesSearchPage /> },
    { path: 'payment-search', element: <PaymentSearchPage /> },
    { path: 'fee-types', element: <FeeTypesPage /> },
    { path: 'fee-groups', element: <FeeGroupsPage /> },
    { path: 'discounts', element: <FeeDiscountsPage /> },
    { path: 'discounts/assign', element: <AssignDiscountsPage /> },
    { path: 'assign', element: <FeeAssignPage /> },
    { path: 'reminders', element: <FeeRemindersPage /> },
  ]),

  createModuleRoutes('/examinations', ROUTES.examinations.groups, [
    { path: 'groups', element: <ExamGroupsPage /> },
    { path: 'exams', element: <ExamsPage /> },
    { path: 'enroll', element: <ExamEnrollPage /> },
    { path: 'schedule', element: <ExamSchedulePage /> },
    { path: 'results', element: <ExamResultsPage /> },
    { path: 'grades', element: <GradesPage /> },
    { path: 'divisions', element: <MarkDivisionsPage /> },
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
  createModuleRoutes('/lesson-plan', ROUTES.lessonPlan.syllabusStatus, [
    {
      path: 'syllabus-status',
      element: <SyllabusStatusPage />,
      handle: {
        page: { title: 'Syllabus Status', description: 'Manage syllabus status' },
      },
    },
    {
      path: 'lessons',
      element: <LessonPage />,
      handle: {
        page: { title: 'Lessons', description: 'Manage lessons' },
      },
    },
  ]),
  createPlaceholderModule('/online-examinations', ROUTES.onlineExams.exams),
  createPlaceholderModule('/income', ROUTES.income.list),
  createPlaceholderModule('/expense', ROUTES.expense.list),
  createModuleRoutes('/finance', ROUTES.finance.chartOfAccounts, [
    { path: 'ledgers', element: <LedgersPage /> },
  ]),
  createPlaceholderModule('/reports', ROUTES.reports.students),
  createPlaceholderModule('/certificates', ROUTES.certificates.templates),
  createPlaceholderModule('/alumni', ROUTES.alumni.list),
  createPlaceholderModule('/leads', ROUTES.leads.all),
  createPlaceholderModule('/cms', ROUTES.cms.events),
];
