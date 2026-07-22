import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ROUTES, LEGACY_SETTINGS_SESSIONS } from '@constants/routes';
import { ModuleLayout } from '@layouts/ModuleLayout';
import { HostelLayout } from '@layouts/HostelLayout';
import { HomeworkLayout } from '@layouts/HomeworkLayout';
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

const LedgerGroupsPage = lazy(() =>
  import('@features/finance/ledger-groups/pages/LedgerGroupsPage').then((m) => ({
    default: m.LedgerGroupsPage,
  })),
);

const JournalEntriesPage = lazy(() =>
  import('@features/finance/journal-entries/pages/JournalEntriesPage').then((m) => ({
    default: m.JournalEntriesPage,
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

const SmsSettingsPage = lazy(() =>
  import('@features/settings/sms/pages/SmsSettingsPage').then((m) => ({
    default: m.SmsSettingsPage,
  })),
);

const EmailSettingsPage = lazy(() =>
  import('@features/settings/email/pages/EmailSettingsPage').then((m) => ({
    default: m.EmailSettingsPage,
  })),
);

const NotificationSettingsPage = lazy(() =>
  import('@features/settings/notifications/pages/NotificationSettingsPage').then((m) => ({
    default: m.NotificationSettingsPage,
  })),
);

const PrintHeaderFooterPage = lazy(() =>
  import('@features/settings/print-header-footer/pages/PrintHeaderFooterPage').then((m) => ({
    default: m.PrintHeaderFooterPage,
  })),
);

const PaymentMethodsPage = lazy(() =>
  import('@features/settings/payment-methods/pages/PaymentMethodsPage').then((m) => ({
    default: m.PaymentMethodsPage,
  })),
);

const RolesPage = lazy(() =>
  import('@features/settings/roles/pages/RolesPage').then((m) => ({
    default: m.RolesPage,
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

const StudentCategoriesPage = lazy(() =>
  import('@features/students/categories/pages/StudentCategoriesPage').then((m) => ({
    default: m.StudentCategoriesPage,
  })),
);

const StudentHousesPage = lazy(() =>
  import('@features/students/houses/pages/StudentHousesPage').then((m) => ({
    default: m.StudentHousesPage,
  })),
);

const ImportStudentsPage = lazy(() =>
  import('@features/students/import/pages/ImportStudentsPage').then((m) => ({
    default: m.ImportStudentsPage,
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

const DepartmentsPage = lazy(() =>
  import('@features/staff/departments/pages/DepartmentsPage').then((m) => ({
    default: m.DepartmentsPage,
  })),
);

const DesignationsPage = lazy(() =>
  import('@features/staff/designations/pages/DesignationsPage').then((m) => ({
    default: m.DesignationsPage,
  })),
);

const StaffAttendancePage = lazy(() =>
  import('@features/staff/attendance/pages/StaffAttendancePage').then((m) => ({
    default: m.StaffAttendancePage,
  })),
);

const StaffPayrollPage = lazy(() =>
  import('@features/staff/payroll/pages/StaffPayrollPage').then((m) => ({
    default: m.StaffPayrollPage,
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

const FeeMastersPage = lazy(() =>
  import('@features/fees/fee-masters/pages/FeeMastersPage').then((m) => ({
    default: m.FeeMastersPage,
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

const SubjectAttendancePage = lazy(() =>
  import('@features/attendance/subject/pages/SubjectAttendancePage').then((m) => ({
    default: m.SubjectAttendancePage,
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

const EnquiryPage = lazy(() =>
  import('@features/front-office/enquiry/pages/EnquiryPage').then((m) => ({
    default: m.EnquiryPage,
  })),
);

const OnlineAdmissionsPage = lazy(() =>
  import('@features/admissions/pages/OnlineAdmissionsPage').then((m) => ({
    default: m.OnlineAdmissionsPage,
  })),
);

const CbseExamsPage = lazy(() =>
  import('@features/examinations/cbse-exams/pages/CbseExamsPage').then((m) => ({
    default: m.CbseExamsPage,
  })),
);

const MarksheetPage = lazy(() =>
  import('@features/examinations/marksheet/pages/MarksheetPage').then((m) => ({
    default: m.MarksheetPage,
  })),
);

const AdmitCardPage = lazy(() =>
  import('@features/examinations/admit-card/pages/AdmitCardPage').then((m) => ({
    default: m.AdmitCardPage,
  })),
);

const HostelsPage = lazy(() =>
  import('@features/hostel/buildings/pages/HostelsPage').then((m) => ({
    default: m.HostelsPage,
  })),
);

const HostelRoomsPage = lazy(() =>
  import('@features/hostel/rooms/pages/HostelRoomsPage').then((m) => ({
    default: m.HostelRoomsPage,
  })),
);

const RoomTypesPage = lazy(() =>
  import('@features/hostel/room-types/pages/RoomTypesPage').then((m) => ({
    default: m.RoomTypesPage,
  })),
);

const PaymentGatewaysPage = lazy(() =>
  import('@features/fees/payment-gateways/pages/PaymentGatewaysPage').then((m) => ({
    default: m.PaymentGatewaysPage,
  })),
);

const NoticesPage = lazy(() =>
  import('@features/communications/notices/pages/NoticesPage').then((m) => ({
    default: m.NoticesPage,
  })),
);

const HomeworkPage = lazy(() =>
  import('@features/homework/pages/HomeworkPage').then((m) => ({
    default: m.HomeworkPage,
  })),
);

const DailyAssignmentPage = lazy(() =>
  import('@features/homework/pages/DailyAssignmentPage').then((m) => ({
    default: m.DailyAssignmentPage,
  })),
);

const TransportFeesPage = lazy(() =>
  import('@features/transport/fees/pages/TransportFeesPage').then((m) => ({
    default: m.TransportFeesPage,
  })),
);

const PickupPointsPage = lazy(() =>
  import('@features/transport/pickup-points/pages/PickupPointsPage').then((m) => ({
    default: m.PickupPointsPage,
  })),
);

const TransportRoutesPage = lazy(() =>
  import('@features/transport/routes/pages/TransportRoutesPage').then((m) => ({
    default: m.TransportRoutesPage,
  })),
);

const VehiclesPage = lazy(() =>
  import('@features/transport/vehicles/pages/VehiclesPage').then((m) => ({
    default: m.VehiclesPage,
  })),
);

const VehicleRouteAssignPage = lazy(() =>
  import('@features/transport/assign-vehicle/pages/VehicleRouteAssignPage').then((m) => ({
    default: m.VehicleRouteAssignPage,
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
      { path: 'categories', element: <StudentCategoriesPage /> },
      { path: 'houses', element: <StudentHousesPage /> },
      { path: 'import', element: <ImportStudentsPage /> },
      { path: 'disabled', element: <DisabledStudentsPage /> },
      { path: 'online-admission', element: <OnlineAdmissionsPage /> },
      { path: ':studentId', element: <StudentProfilePage /> },
      ...buildPlaceholderChildren('/students'),
    ],
  },

  {
    path: 'staff',
    element: <ModuleLayout />,
    children: [
      { index: true, element: <StaffPage /> },
      { path: 'departments', element: <DepartmentsPage /> },
      { path: 'designations', element: <DesignationsPage /> },
      { path: 'attendance', element: <StaffAttendancePage /> },
      { path: 'payroll', element: <StaffPayrollPage /> },
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
    { path: 'subject', element: <SubjectAttendancePage /> },
  ]),

  createModuleRoutes('/fees', ROUTES.fees.feeTypes, [
    { path: 'collect', element: <CollectFeesPage /> },
    { path: 'due-search', element: <DueFeesSearchPage /> },
    { path: 'payment-search', element: <PaymentSearchPage /> },
    { path: 'fee-types', element: <FeeTypesPage /> },
    { path: 'fee-groups', element: <FeeGroupsPage /> },
    { path: 'fee-masters', element: <FeeMastersPage /> },
    { path: 'master', element: <FeeMastersPage /> },
    { path: 'discounts', element: <FeeDiscountsPage /> },
    { path: 'discounts/assign', element: <AssignDiscountsPage /> },
    { path: 'assign', element: <FeeAssignPage /> },
    { path: 'reminders', element: <FeeRemindersPage /> },
    { path: 'payment-gateways', element: <PaymentGatewaysPage /> },
    { path: 'offline-payments', element: <PaymentGatewaysPage /> },
  ]),

  createModuleRoutes('/examinations', ROUTES.examinations.groups, [
    { path: 'groups', element: <ExamGroupsPage /> },
    { path: 'exams', element: <ExamsPage /> },
    { path: 'enroll', element: <ExamEnrollPage /> },
    { path: 'schedule', element: <ExamSchedulePage /> },
    { path: 'results', element: <ExamResultsPage /> },
    { path: 'grades', element: <GradesPage /> },
    { path: 'divisions', element: <MarkDivisionsPage /> },
    { path: 'cbse-exams', element: <CbseExamsPage /> },
    { path: 'marksheet', element: <MarksheetPage /> },
    { path: 'admit-card', element: <AdmitCardPage /> },
  ]),

  createModuleRoutes('/settings', ROUTES.settings.general, [
    { path: 'general', element: <GeneralSettingsPage /> },
    { path: 'languages', element: <LanguagesPage /> },
    { path: 'currency', element: <CurrencyPage /> },
    { path: 'sms', element: <SmsSettingsPage /> },
    { path: 'email', element: <EmailSettingsPage /> },
    { path: 'notifications', element: <NotificationSettingsPage /> },
    { path: 'print-header-footer', element: <PrintHeaderFooterPage /> },
    { path: 'payment-methods', element: <PaymentMethodsPage /> },
    { path: 'roles', element: <RolesPage /> },
  ]),

  createModuleRoutes('/front-office', ROUTES.frontOffice.enquiry, [
    { path: 'enquiry', element: <EnquiryPage /> },
  ]),
  createPlaceholderModule('/library', ROUTES.library.books),
  createModuleRoutes('/transport', ROUTES.transport.fees, [
    { path: 'fees', element: <TransportFeesPage /> },
    { path: 'pickup-points', element: <PickupPointsPage /> },
    { path: 'routes', element: <TransportRoutesPage /> },
    { path: 'vehicles', element: <VehiclesPage /> },
    { path: 'assign-vehicle', element: <VehicleRouteAssignPage /> },
  ]),
  {
    path: 'hostel',
    element: <HostelLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.hostel.rooms} replace /> },
      { path: 'buildings', element: <HostelsPage /> },
      { path: 'rooms', element: <HostelRoomsPage /> },
      { path: 'room-types', element: <RoomTypesPage /> },
      ...buildPlaceholderChildren('/hostel'),
    ],
  },
  createPlaceholderModule('/inventory', ROUTES.inventory.issue),
  {
    path: 'homework',
    element: <HomeworkLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.homework.assignments} replace /> },
      { path: 'assignments', element: <HomeworkPage /> },
      { path: 'daily', element: <DailyAssignmentPage /> },
      ...buildPlaceholderChildren('/homework'),
    ],
  },
  createModuleRoutes('/communicate', ROUTES.communicate.notices, [
    { path: 'notices', element: <NoticesPage /> },
  ]),
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
    { path: 'groups', element: <LedgerGroupsPage /> },
    { path: 'entries', element: <JournalEntriesPage /> },
  ]),
  createPlaceholderModule('/reports', ROUTES.reports.students),
  createPlaceholderModule('/certificates', ROUTES.certificates.templates),
  createPlaceholderModule('/alumni', ROUTES.alumni.list),
  createPlaceholderModule('/leads', ROUTES.leads.all),
  createPlaceholderModule('/cms', ROUTES.cms.events),
];
