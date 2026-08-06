import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ROUTES, LEGACY_SETTINGS_SESSIONS } from '@constants/routes';
import { ModuleLayout } from '@layouts/ModuleLayout';
import { buildPlaceholderChildren, createModuleRoutes } from '@routes/module-routes';

const DashboardPage = lazy(() =>
  import('@features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
);

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
  import('@features/finance/entries/pages/JournalEntriesPage').then((m) => ({
    default: m.JournalEntriesPage,
  })),
);

const FeeMapperPage = lazy(() =>
  import('@features/finance/mapper/pages/FeeMapperPage').then((m) => ({
    default: m.FeeMapperPage,
  })),
);

const ChartOfAccountsPage = lazy(() =>
  import('@features/finance/chart-of-accounts/pages/ChartOfAccountsPage').then((m) => ({
    default: m.ChartOfAccountsPage,
  })),
);

const FinanceReportsHubPage = lazy(() =>
  import('@features/finance/reports/pages/FinanceReportsHubPage').then((m) => ({
    default: m.FinanceReportsHubPage,
  })),
);
const TrialBalancePage = lazy(() =>
  import('@features/finance/reports/pages/TrialBalancePage').then((m) => ({
    default: m.TrialBalancePage,
  })),
);
const BalanceSheetPage = lazy(() =>
  import('@features/finance/reports/pages/BalanceSheetPage').then((m) => ({
    default: m.BalanceSheetPage,
  })),
);
const ProfitLossPage = lazy(() =>
  import('@features/finance/reports/pages/ProfitLossPage').then((m) => ({
    default: m.ProfitLossPage,
  })),
);
const LedgerStatementPage = lazy(() =>
  import('@features/finance/reports/pages/LedgerStatementPage').then((m) => ({
    default: m.LedgerStatementPage,
  })),
);
const LedgerEntriesPage = lazy(() =>
  import('@features/finance/reports/pages/LedgerEntriesPage').then((m) => ({
    default: m.LedgerEntriesPage,
  })),
);
const ReconciliationPage = lazy(() =>
  import('@features/finance/reports/pages/ReconciliationPage').then((m) => ({
    default: m.ReconciliationPage,
  })),
);

const AlumniListPage = lazy(() =>
  import('@features/alumni/pages/AlumniListPage').then((m) => ({
    default: m.AlumniListPage,
  })),
);
const AlumniEventsPage = lazy(() =>
  import('@features/alumni/pages/AlumniEventsPage').then((m) => ({
    default: m.AlumniEventsPage,
  })),
);
const AlumniReportPage = lazy(() =>
  import('@features/reports/alumni/pages/AlumniReportPage').then((m) => ({
    default: m.AlumniReportPage,
  })),
);
const InventoryReportPage = lazy(() =>
  import('@features/reports/inventory/pages/InventoryReportPage').then((m) => ({
    default: m.InventoryReportPage,
  })),
);
const HomeworkReportPage = lazy(() =>
  import('@features/reports/homework/pages/HomeworkReportPage').then((m) => ({
    default: m.HomeworkReportPage,
  })),
);

const LeadsPage = lazy(() =>
  import('@features/leads/pages/LeadsPage').then((m) => ({ default: m.LeadsPage })),
);
const CampaignsPage = lazy(() =>
  import('@features/leads/pages/CampaignsPage').then((m) => ({ default: m.CampaignsPage })),
);
const CampaignTypesPage = lazy(() =>
  import('@features/leads/pages/CampaignTypesPage').then((m) => ({
    default: m.CampaignTypesPage,
  })),
);
const PromotersPage = lazy(() =>
  import('@features/leads/pages/PromotersPage').then((m) => ({ default: m.PromotersPage })),
);
const FollowupStatusPage = lazy(() =>
  import('@features/leads/pages/FollowupStatusPage').then((m) => ({
    default: m.FollowupStatusPage,
  })),
);
const FollowupsPage = lazy(() =>
  import('@features/leads/pages/FollowupsPage').then((m) => ({ default: m.FollowupsPage })),
);
const LeadReportsPage = lazy(() =>
  import('@features/leads/pages/LeadReportsPage').then((m) => ({ default: m.LeadReportsPage })),
);

const CmsEventsPage = lazy(() =>
  import('@features/cms/pages/EventsPage').then((m) => ({ default: m.EventsPage })),
);
const CmsGalleryPage = lazy(() =>
  import('@features/cms/pages/GalleryPage').then((m) => ({ default: m.GalleryPage })),
);
const CmsMediaPage = lazy(() =>
  import('@features/cms/pages/MediaPage').then((m) => ({ default: m.MediaPage })),
);
const CmsNoticesPage = lazy(() =>
  import('@features/cms/pages/NoticesPage').then((m) => ({ default: m.NoticesPage })),
);
const CmsPagesPage = lazy(() =>
  import('@features/cms/pages/PagesPage').then((m) => ({ default: m.PagesPage })),
);
const CmsMenusPage = lazy(() =>
  import('@features/cms/pages/MenusPage').then((m) => ({ default: m.MenusPage })),
);
const CmsBannersPage = lazy(() =>
  import('@features/cms/pages/BannersPage').then((m) => ({ default: m.BannersPage })),
);
const CmsSettingsPage = lazy(() =>
  import('@features/cms/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
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

const StudentProfileUpdatePage = lazy(() =>
  import('@features/settings/student-profile-update/pages/StudentProfileUpdatePage').then((m) => ({
    default: m.StudentProfileUpdatePage,
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

const RolesPage = lazy(() =>
  import('@features/settings/roles/pages/RolesPage').then((m) => ({
    default: m.RolesPage,
  })),
);

const UsersPage = lazy(() =>
  import('@features/settings/users/pages/UsersPage').then((m) => ({
    default: m.UsersPage,
  })),
);

const NotificationSettingsPage = lazy(() =>
  import('@features/settings/notifications/pages/NotificationSettingsPage').then((m) => ({
    default: m.NotificationSettingsPage,
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

const PaymentMethodsPage = lazy(() =>
  import('@features/settings/payment-methods/pages/PaymentMethodsPage').then((m) => ({
    default: m.PaymentMethodsPage,
  })),
);

const PrintHeaderFooterPage = lazy(() =>
  import('@features/settings/print-header-footer/pages/PrintHeaderFooterPage').then((m) => ({
    default: m.PrintHeaderFooterPage,
  })),
);

const ModulesPage = lazy(() =>
  import('@features/settings/modules/pages/ModulesPage').then((m) => ({
    default: m.ModulesPage,
  })),
);

const CustomFieldsPage = lazy(() =>
  import('@features/settings/custom-fields/pages/CustomFieldsPage').then((m) => ({
    default: m.CustomFieldsPage,
  })),
);

const CaptchaPage = lazy(() =>
  import('@features/settings/captcha/pages/CaptchaPage').then((m) => ({
    default: m.CaptchaPage,
  })),
);

const SystemFieldsPage = lazy(() =>
  import('@features/settings/system-fields/pages/SystemFieldsPage').then((m) => ({
    default: m.SystemFieldsPage,
  })),
);

const OnlineAdmissionSettingsPage = lazy(() =>
  import('@features/settings/online-admission-settings/pages/OnlineAdmissionSettingsPage').then(
    (m) => ({ default: m.OnlineAdmissionSettingsPage }),
  ),
);

const SidebarMenuPage = lazy(() =>
  import('@features/settings/sidebar-menu/pages/SidebarMenuPage').then((m) => ({
    default: m.SidebarMenuPage,
  })),
);

const BackupPage = lazy(() =>
  import('@features/settings/backup/pages/BackupPage').then((m) => ({
    default: m.BackupPage,
  })),
);

const FileTypesPage = lazy(() =>
  import('@features/settings/file-types/pages/FileTypesPage').then((m) => ({
    default: m.FileTypesPage,
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

const LessonsPage = lazy(() =>
  import('@features/academics/lessons/pages/LessonsPage').then((m) => ({
    default: m.LessonsPage,
  })),
);

const TopicsPage = lazy(() =>
  import('@features/academics/lessons/pages/TopicsPage').then((m) => ({
    default: m.TopicsPage,
  })),
);

const ManageLessonPlanPage = lazy(() =>
  import('@features/academics/lessons/pages/ManageLessonPlanPage').then((m) => ({
    default: m.ManageLessonPlanPage,
  })),
);

const CopyOldLessonsPage = lazy(() =>
  import('@features/academics/lessons/pages/CopyOldLessonsPage').then((m) => ({
    default: m.CopyOldLessonsPage,
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
  import('@features/students/pages/StudentCategoriesPage').then((m) => ({
    default: m.StudentCategoriesPage,
  })),
);

const StudentHousesPage = lazy(() =>
  import('@features/students/pages/StudentHousesPage').then((m) => ({
    default: m.StudentHousesPage,
  })),
);

const ImportStudentsPage = lazy(() =>
  import('@features/students/pages/ImportStudentsPage').then((m) => ({
    default: m.ImportStudentsPage,
  })),
);

const BulkDeletePage = lazy(() =>
  import('@features/students/pages/BulkDeletePage').then((m) => ({
    default: m.BulkDeletePage,
  })),
);

const DisableReasonPage = lazy(() =>
  import('@features/students/pages/DisableReasonPage').then((m) => ({
    default: m.DisableReasonPage,
  })),
);

const MultiClassPage = lazy(() =>
  import('@features/students/pages/MultiClassPage').then((m) => ({
    default: m.MultiClassPage,
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

const StaffAttendancePage = lazy(() =>
  import('@features/staff/pages/StaffAttendancePage').then((m) => ({
    default: m.StaffAttendancePage,
  })),
);

const StaffPayrollPage = lazy(() =>
  import('@features/staff/pages/StaffPayrollPage').then((m) => ({
    default: m.StaffPayrollPage,
  })),
);

const PayrollIncrementPage = lazy(() =>
  import('@features/staff/pages/PayrollIncrementPage').then((m) => ({
    default: m.PayrollIncrementPage,
  })),
);

const ApprovePayrollIncrementPage = lazy(() =>
  import('@features/staff/pages/ApprovePayrollIncrementPage').then((m) => ({
    default: m.ApprovePayrollIncrementPage,
  })),
);

const AssignIncidentPage = lazy(() =>
  import('@features/behaviour/pages/AssignIncidentPage').then((m) => ({
    default: m.AssignIncidentPage,
  })),
);

const IncidentsPage = lazy(() =>
  import('@features/behaviour/pages/IncidentsPage').then((m) => ({
    default: m.IncidentsPage,
  })),
);

const IncidentReportsPage = lazy(() =>
  import('@features/behaviour/pages/IncidentReportsPage').then((m) => ({
    default: m.IncidentReportsPage,
  })),
);

const IncidentSettingPage = lazy(() =>
  import('@features/behaviour/pages/IncidentSettingPage').then((m) => ({
    default: m.IncidentSettingPage,
  })),
);

const StaffDepartmentsPage = lazy(() =>
  import('@features/staff/pages/StaffDepartmentsPage').then((m) => ({
    default: m.StaffDepartmentsPage,
  })),
);

const StaffDesignationsPage = lazy(() =>
  import('@features/staff/pages/StaffDesignationsPage').then((m) => ({
    default: m.StaffDesignationsPage,
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

const AssignFeesToStudentsPage = lazy(() =>
  import('@features/fees/assign/pages/AssignFeesToStudentsPage').then((m) => ({
    default: m.AssignFeesToStudentsPage,
  })),
);

const FeeCarryForwardPage = lazy(() =>
  import('@features/fees/carry-forward/pages/FeeCarryForwardPage').then((m) => ({
    default: m.FeeCarryForwardPage,
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

const SchemeScholarshipPage = lazy(() =>
  import('@features/fees/pages/SchemeScholarshipPage').then((m) => ({
    default: m.SchemeScholarshipPage,
  })),
);

const ApplySchemeScholarshipPage = lazy(() =>
  import('@features/fees/pages/ApplySchemeScholarshipPage').then((m) => ({
    default: m.ApplySchemeScholarshipPage,
  })),
);

const PositiveFeeAdjustmentPage = lazy(() =>
  import('@features/fees/pages/PositiveFeeAdjustmentPage').then((m) => ({
    default: m.PositiveFeeAdjustmentPage,
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

const PeriodAttendanceByDatePage = lazy(() =>
  import('@features/attendance/subject/pages/PeriodAttendanceByDatePage').then((m) => ({
    default: m.PeriodAttendanceByDatePage,
  })),
);

const HostelAttendancePage = lazy(() =>
  import('@features/attendance/hostel/pages/HostelAttendancePage').then((m) => ({
    default: m.HostelAttendancePage,
  })),
);

const AttendanceReportPage = lazy(() =>
  import('@features/attendance/report/pages/AttendanceReportPage').then((m) => ({
    default: m.AttendanceReportPage,
  })),
);

const StudentReportPage = lazy(() =>
  import('@features/reports/students/pages/StudentReportPage').then((m) => ({
    default: m.StudentReportPage,
  })),
);

const FeesReportPage = lazy(() =>
  import('@features/reports/fees/pages/FeesReportPage').then((m) => ({
    default: m.FeesReportPage,
  })),
);

const ExamReportPage = lazy(() =>
  import('@features/reports/examinations/pages/ExamReportPage').then((m) => ({
    default: m.ExamReportPage,
  })),
);

const IncomeExpenseReportPage = lazy(() =>
  import('@features/reports/finance/pages/IncomeExpenseReportPage').then((m) => ({
    default: m.IncomeExpenseReportPage,
  })),
);

const StaffReportPage = lazy(() =>
  import('@features/reports/hr/pages/StaffReportPage').then((m) => ({
    default: m.StaffReportPage,
  })),
);

const TransportHostelReportPage = lazy(() =>
  import('@features/reports/transport/pages/TransportHostelReportPage').then((m) => ({
    default: m.TransportHostelReportPage,
  })),
);

const LibraryReportPage = lazy(() =>
  import('@features/reports/library/pages/LibraryReportPage').then((m) => ({
    default: m.LibraryReportPage,
  })),
);

const LessonPlanReportPage = lazy(() =>
  import('@features/reports/lesson-plan/pages/LessonPlanReportPage').then((m) => ({
    default: m.LessonPlanReportPage,
  })),
);

const UserLogReportPage = lazy(() =>
  import('@features/reports/user-log/pages/UserLogReportPage').then((m) => ({
    default: m.UserLogReportPage,
  })),
);

const AuditTrailReportPage = lazy(() =>
  import('@features/reports/audit-trail/pages/AuditTrailReportPage').then((m) => ({
    default: m.AuditTrailReportPage,
  })),
);

const OnlineExamReportPage = lazy(() =>
  import('@features/reports/online-exams/pages/OnlineExamReportPage').then((m) => ({
    default: m.OnlineExamReportPage,
  })),
);

const TimetableReportPage = lazy(() =>
  import('@features/reports/timetable/pages/TimetableReportPage').then((m) => ({
    default: m.TimetableReportPage,
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

const AdmitCardTemplatesPage = lazy(() =>
  import('@features/examinations/admit-card/pages/AdmitCardTemplatesPage').then((m) => ({
    default: m.AdmitCardTemplatesPage,
  })),
);

const MarksheetTemplatesPage = lazy(() =>
  import('@features/examinations/marksheet/pages/MarksheetTemplatesPage').then((m) => ({
    default: m.MarksheetTemplatesPage,
  })),
);

const EnquiryPage = lazy(() =>
  import('@features/front-office/enquiry/pages/EnquiryPage').then((m) => ({
    default: m.EnquiryPage,
  })),
);

const VisitorsPage = lazy(() =>
  import('@features/front-office/visitors/pages/VisitorsPage').then((m) => ({
    default: m.VisitorsPage,
  })),
);

const PhoneCallLogPage = lazy(() =>
  import('@features/front-office/phone-calls/pages/PhoneCallLogPage').then((m) => ({
    default: m.PhoneCallLogPage,
  })),
);

const SetupFrontOfficePage = lazy(() =>
  import('@features/front-office/setup/pages/SetupFrontOfficePage').then((m) => ({
    default: m.SetupFrontOfficePage,
  })),
);

const ComplaintsPage = lazy(() =>
  import('@features/front-office/complaints/pages/ComplaintsPage').then((m) => ({
    default: m.ComplaintsPage,
  })),
);

const PostalDispatchPage = lazy(() =>
  import('@features/front-office/postal/pages/PostalRecordsPage').then((m) => ({
    default: m.PostalDispatchPage,
  })),
);

const PostalReceivePage = lazy(() =>
  import('@features/front-office/postal/pages/PostalRecordsPage').then((m) => ({
    default: m.PostalReceivePage,
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

const OfflineBankPaymentsPage = lazy(() =>
  import('@features/fees/offline-payments/pages/OfflineBankPaymentsPage').then((m) => ({
    default: m.OfflineBankPaymentsPage,
  })),
);

const LibraryBooksPage = lazy(() =>
  import('@features/library/books/pages/BooksPage').then((m) => ({
    default: m.BooksPage,
  })),
);

const LibraryIssueReturnPage = lazy(() =>
  import('@features/library/issue-return/pages/IssueReturnPage').then((m) => ({
    default: m.IssueReturnPage,
  })),
);

const LibraryAddStudentPage = lazy(() =>
  import('@features/library/members/pages/AddStudentPage').then((m) => ({
    default: m.AddStudentPage,
  })),
);

const LibraryAddStaffPage = lazy(() =>
  import('@features/library/members/pages/AddStaffPage').then((m) => ({
    default: m.AddStaffPage,
  })),
);

const ItemCategoriesPage = lazy(() =>
  import('@features/inventory/categories/pages/ItemCategoriesPage').then((m) => ({
    default: m.ItemCategoriesPage,
  })),
);

const ItemStoresPage = lazy(() =>
  import('@features/inventory/stores/pages/ItemStoresPage').then((m) => ({
    default: m.ItemStoresPage,
  })),
);

const ItemSuppliersPage = lazy(() =>
  import('@features/inventory/suppliers/pages/ItemSuppliersPage').then((m) => ({
    default: m.ItemSuppliersPage,
  })),
);

const InventoryItemsPage = lazy(() =>
  import('@features/inventory/items/pages/InventoryItemsPage').then((m) => ({
    default: m.InventoryItemsPage,
  })),
);

const ItemStockPage = lazy(() =>
  import('@features/inventory/stock/pages/ItemStockPage').then((m) => ({
    default: m.ItemStockPage,
  })),
);

const ItemIssuePage = lazy(() =>
  import('@features/inventory/issue/pages/ItemIssuePage').then((m) => ({
    default: m.ItemIssuePage,
  })),
);

const IncomeListPage = lazy(() =>
  import('@features/income/list/pages/IncomeListPage').then((m) => ({
    default: m.IncomeListPage,
  })),
);

const IncomeHeadsPage = lazy(() =>
  import('@features/income/heads/pages/IncomeHeadsPage').then((m) => ({
    default: m.IncomeHeadsPage,
  })),
);

const SearchIncomePage = lazy(() =>
  import('@features/income/search/SearchIncomePage').then((m) => ({
    default: m.SearchIncomePage,
  })),
);

const ExpenseListPage = lazy(() =>
  import('@features/expense/list/pages/ExpenseListPage').then((m) => ({
    default: m.ExpenseListPage,
  })),
);

const ExpenseHeadsPage = lazy(() =>
  import('@features/expense/heads/pages/ExpenseHeadsPage').then((m) => ({
    default: m.ExpenseHeadsPage,
  })),
);

const SearchExpensePage = lazy(() =>
  import('@features/expense/search/SearchExpensePage').then((m) => ({
    default: m.SearchExpensePage,
  })),
);

const CertificateTemplatesPage = lazy(() =>
  import('@features/certificates/templates/pages/CertificateTemplatesPage').then((m) => ({
    default: m.CertificateTemplatesPage,
  })),
);

const GenerateCertificatePage = lazy(() =>
  import('@features/certificates/generate/pages/GenerateCertificatePage').then((m) => ({
    default: m.GenerateCertificatePage,
  })),
);

const StudentIdCardTemplatesPage = lazy(() =>
  import('@features/certificates/id-cards/pages/StudentIdCardTemplatesPage').then((m) => ({
    default: m.StudentIdCardTemplatesPage,
  })),
);

const GenerateStudentIdCardPage = lazy(() =>
  import('@features/certificates/id-cards/pages/GenerateStudentIdCardPage').then((m) => ({
    default: m.GenerateStudentIdCardPage,
  })),
);

const StaffIdCardTemplatesPage = lazy(() =>
  import('@features/certificates/id-cards/pages/StaffIdCardTemplatesPage').then((m) => ({
    default: m.StaffIdCardTemplatesPage,
  })),
);

const GenerateStaffIdCardPage = lazy(() =>
  import('@features/certificates/id-cards/pages/GenerateStaffIdCardPage').then((m) => ({
    default: m.GenerateStaffIdCardPage,
  })),
);

const ContentTypesPage = lazy(() =>
  import('@features/download-center/pages/ContentTypesPage').then((m) => ({
    default: m.ContentTypesPage,
  })),
);

const UploadContentPage = lazy(() =>
  import('@features/download-center/pages/UploadContentPage').then((m) => ({
    default: m.UploadContentPage,
  })),
);

const VideoTutorialsPage = lazy(() =>
  import('@features/download-center/pages/VideoTutorialsPage').then((m) => ({
    default: m.VideoTutorialsPage,
  })),
);

const ContentShareListPage = lazy(() =>
  import('@features/download-center/pages/Contentsharelist').then((m) => ({
    default: m.default,
  })),
);

const OnlineExamsPage = lazy(() =>
  import('@features/online-examinations/exams/pages/OnlineExamsPage').then((m) => ({
    default: m.OnlineExamsPage,
  })),
);

const QuestionBankPage = lazy(() =>
  import('@features/online-examinations/question-bank/pages/QuestionBankPage').then((m) => ({
    default: m.QuestionBankPage,
  })),
);

const NoticesPage = lazy(() =>
  import('@features/communications/notices/pages/NoticesPage').then((m) => ({
    default: m.NoticesPage,
  })),
);

const EmailSmsPage = lazy(() =>
  import('@features/communications/email-sms/pages/EmailSmsPage').then((m) => ({
    default: m.EmailSmsPage,
  })),
);

const BulkEmailPage = lazy(() =>
  import('@features/communications/bulk-email/pages/BulkEmailPage').then((m) => ({
    default: m.BulkEmailPage,
  })),
);

const SendEmailPage = lazy(() =>
  import('@features/communications/email-sms/pages/SendEmailPage').then((m) => ({
    default: m.SendEmailPage,
  })),
);

const SendSmsPage = lazy(() =>
  import('@features/communications/email-sms/pages/SendSmsPage').then((m) => ({
    default: m.SendSmsPage,
  })),
);

const EmailSmsLogPage = lazy(() =>
  import('@features/communications/email-sms/pages/EmailSmsLogPage').then((m) => ({
    default: m.EmailSmsLogPage,
  })),
);

const ScheduleLogPage = lazy(() =>
  import('@features/communications/email-sms/pages/ScheduleLogPage').then((m) => ({
    default: m.ScheduleLogPage,
  })),
);

const EmailTemplatesPage = lazy(() =>
  import('@features/communications/email-templates/pages/EmailTemplatesPage').then((m) => ({
    default: m.EmailTemplatesPage,
  })),
);

const SmsTemplatesPage = lazy(() =>
  import('@features/communications/sms-templates/pages/SmsTemplatesPage').then((m) => ({
    default: m.SmsTemplatesPage,
  })),
);

const HomeworkPage = lazy(() =>
  import('@features/homework/assignments/pages/HomeworkPage').then((m) => ({
    default: m.HomeworkPage,
  })),
);

const DailyAssignmentsPage = lazy(() =>
  import('@features/homework/daily/pages/DailyAssignmentsPage').then((m) => ({
    default: m.DailyAssignmentsPage,
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

const RoutePickupPointsPage = lazy(() =>
  import('@features/transport/route-pickup-points/pages/RoutePickupPointsPage').then((m) => ({
    default: m.RoutePickupPointsPage,
  })),
);

const LmsCourseListPage = lazy(() =>
  import('@features/lms/courses/pages/CourseListPage').then((m) => ({
    default: m.default,
  })),
);

const LmsCourseCreatePage = lazy(() =>
  import('@features/lms/courses/pages/CourseCreatePage').then((m) => ({
    default: m.default,
  })),
);

const LmsCourseEditPage = lazy(() =>
  import('@features/lms/courses/pages/CourseEditPage').then((m) => ({
    default: m.default,
  })),
);

const StudentTransportFeesPage = lazy(() =>
  import('@features/transport/pages/StudentTransportFeesPage').then((m) => ({
    default: m.StudentTransportFeesPage,
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

  createModuleRoutes('/lms', ROUTES.lms.courses.root, [
    { path: 'courses', element: <LmsCourseListPage /> },
    { path: 'courses/new', element: <LmsCourseCreatePage /> },
    { path: 'courses/:id/edit', element: <LmsCourseEditPage /> },
  ]),

  {
    path: 'students',
    element: <ModuleLayout />,
    children: [
      { index: true, element: <StudentsPage /> },
      { path: 'categories', element: <StudentCategoriesPage /> },
      { path: 'houses', element: <StudentHousesPage /> },
      { path: 'disabled', element: <DisabledStudentsPage /> },
      { path: 'import', element: <ImportStudentsPage /> },
      { path: 'online-admission', element: <OnlineAdmissionsPage /> },
      { path: 'bulk-delete', element: <BulkDeletePage /> },
      { path: 'disable-reason', element: <DisableReasonPage /> },
      { path: 'multi-class', element: <MultiClassPage /> },
      { path: ':studentId', element: <StudentProfilePage /> },
      ...buildPlaceholderChildren('/students'),
    ],
  },

  {
    path: 'staff',
    element: <ModuleLayout />,
    children: [
      { index: true, element: <StaffPage /> },
      { path: 'attendance', element: <StaffAttendancePage /> },
      { path: 'payroll', element: <StaffPayrollPage /> },
      { path: 'leave-types', element: <LeaveTypesPage /> },
      { path: 'leave', element: <StaffLeaveRequestsPage /> },
      { path: 'leave-allotments', element: <StaffLeaveAllotmentsPage /> },
      { path: 'departments', element: <StaffDepartmentsPage /> },
      { path: 'designations', element: <StaffDesignationsPage /> },
      { path: 'payroll-increment', element: <PayrollIncrementPage /> },
      { path: 'payroll-increment-approve', element: <ApprovePayrollIncrementPage /> },
      { path: ':staffId', element: <StaffProfilePage /> },
      ...buildPlaceholderChildren('/staff'),
    ],
  },

  createModuleRoutes('/attendance', ROUTES.attendance.mark, [
    { path: 'mark', element: <MarkAttendancePage /> },
    { path: 'report', element: <AttendanceReportPage /> },
    { path: 'approve-leave', element: <ApproveLeavePage /> },
    { path: 'subject', element: <SubjectAttendancePage /> },
    { path: 'period-attendance-by-date', element: <PeriodAttendanceByDatePage /> },
    { path: 'hostel', element: <HostelAttendancePage /> },
  ]),

  createModuleRoutes('/fees', ROUTES.fees.feeTypes, [
    { path: 'collect', element: <CollectFeesPage /> },
    { path: 'due-search', element: <DueFeesSearchPage /> },
    { path: 'payment-search', element: <PaymentSearchPage /> },
    { path: 'master', element: <FeeAssignPage /> },
    { path: 'fee-types', element: <FeeTypesPage /> },
    { path: 'fee-groups', element: <FeeGroupsPage /> },
    { path: 'discounts', element: <FeeDiscountsPage /> },
    { path: 'discounts/assign', element: <AssignDiscountsPage /> },
    { path: 'assign', element: <AssignFeesToStudentsPage /> },
    { path: 'carry-forward', element: <FeeCarryForwardPage /> },
    { path: 'reminders', element: <FeeRemindersPage /> },
    { path: 'payment-gateways', element: <PaymentGatewaysPage /> },
    { path: 'offline-payments', element: <OfflineBankPaymentsPage /> },
    { path: 'scheme-scholarship', element: <SchemeScholarshipPage /> },
    { path: 'apply-scheme-scholarship', element: <ApplySchemeScholarshipPage /> },
    { path: 'positive-fee-adjustment', element: <PositiveFeeAdjustmentPage /> },
  ]),

  createModuleRoutes('/examinations', ROUTES.examinations.groups, [
    { path: 'groups', element: <ExamGroupsPage /> },
    { path: 'exams', element: <ExamsPage /> },
    { path: 'enroll', element: <ExamEnrollPage /> },
    { path: 'schedule', element: <ExamSchedulePage /> },
    { path: 'results', element: <ExamResultsPage /> },
    { path: 'admit-card', element: <AdmitCardTemplatesPage /> },
    { path: 'marksheet', element: <MarksheetTemplatesPage /> },
    { path: 'grades', element: <GradesPage /> },
    { path: 'divisions', element: <MarkDivisionsPage /> },
    { path: 'cbse-exams', element: <CbseExamsPage /> },
  ]),

  createModuleRoutes('/settings', ROUTES.settings.general, [
    { path: 'general', element: <GeneralSettingsPage /> },
    { path: 'languages', element: <LanguagesPage /> },
    { path: 'currency', element: <CurrencyPage /> },
    { path: 'notifications', element: <NotificationSettingsPage /> },
    { path: 'sms', element: <SmsSettingsPage /> },
    { path: 'email', element: <EmailSettingsPage /> },
    { path: 'payment-methods', element: <PaymentMethodsPage /> },
    { path: 'print-header-footer', element: <PrintHeaderFooterPage /> },
    { path: 'roles', element: <RolesPage /> },
    { path: 'users', element: <UsersPage /> },
    { path: 'modules', element: <ModulesPage /> },
    { path: 'custom-fields', element: <CustomFieldsPage /> },
    { path: 'captcha', element: <CaptchaPage /> },
    { path: 'system-fields', element: <SystemFieldsPage /> },
    { path: 'student-profile-update', element: <StudentProfileUpdatePage /> },
    { path: 'online-admission', element: <OnlineAdmissionSettingsPage /> },
    { path: 'sidebar-menu', element: <SidebarMenuPage /> },
    { path: 'backup', element: <BackupPage /> },
    { path: 'file-types', element: <FileTypesPage /> },
  ]),

  createModuleRoutes('/front-office', ROUTES.frontOffice.enquiry, [
    { path: 'enquiry', element: <EnquiryPage /> },
    { path: 'visitors', element: <VisitorsPage /> },
    { path: 'phone-calls', element: <PhoneCallLogPage /> },
    { path: 'complaints', element: <ComplaintsPage /> },
    { path: 'dispatch', element: <PostalDispatchPage /> },
    { path: 'receive', element: <PostalReceivePage /> },
    { path: 'setup', element: <SetupFrontOfficePage /> },
  ]),
  createModuleRoutes('/library', ROUTES.library.books, [
    { path: 'books', element: <LibraryBooksPage /> },
    { path: 'issue-return', element: <LibraryIssueReturnPage /> },
    { path: 'add-student', element: <LibraryAddStudentPage /> },
    { path: 'add-staff', element: <LibraryAddStaffPage /> },
  ]),
  createModuleRoutes('/transport', ROUTES.transport.fees, [
    { path: 'fees', element: <TransportFeesPage /> },
    { path: 'pickup-points', element: <PickupPointsPage /> },
    { path: 'routes', element: <TransportRoutesPage /> },
    { path: 'vehicles', element: <VehiclesPage /> },
    { path: 'assign-vehicle', element: <VehicleRouteAssignPage /> },
    { path: 'route-pickup-points', element: <RoutePickupPointsPage /> },
    { path: 'student-fees', element: <StudentTransportFeesPage /> },
  ]),
  createModuleRoutes('/hostel', ROUTES.hostel.rooms, [
    { path: 'buildings', element: <HostelsPage /> },
    { path: 'rooms', element: <HostelRoomsPage /> },
    { path: 'room-types', element: <RoomTypesPage /> },
  ]),
  createModuleRoutes('/inventory', ROUTES.inventory.items, [
    { path: 'categories', element: <ItemCategoriesPage /> },
    { path: 'stores', element: <ItemStoresPage /> },
    { path: 'suppliers', element: <ItemSuppliersPage /> },
    { path: 'items', element: <InventoryItemsPage /> },
    { path: 'stock', element: <ItemStockPage /> },
    { path: 'issue', element: <ItemIssuePage /> },
  ]),
  createModuleRoutes('/homework', ROUTES.homework.assignments, [
    { path: 'assignments', element: <HomeworkPage /> },
    { path: 'daily', element: <DailyAssignmentsPage /> },
  ]),
  createModuleRoutes('/communicate', ROUTES.communicate.notices, [
    { path: 'notices', element: <NoticesPage /> },
    { path: 'send-email', element: <SendEmailPage /> },
    { path: 'send-sms', element: <SendSmsPage /> },
    { path: 'email-sms', element: <EmailSmsPage /> },
    { path: 'email-sms-log', element: <EmailSmsLogPage /> },
    { path: 'schedule-log', element: <ScheduleLogPage /> },
    { path: 'bulk-email', element: <BulkEmailPage /> },
    { path: 'email-template', element: <EmailTemplatesPage /> },
    { path: 'sms-template', element: <SmsTemplatesPage /> },
  ]),
  createModuleRoutes('/download-center', ROUTES.downloadCenter.contentTypes, [
    { path: 'content-types', element: <ContentTypesPage /> },
    { path: 'content', element: <UploadContentPage /> },
    { path: 'videos', element: <VideoTutorialsPage /> },
    { path: 'share-content', element: <ContentShareListPage /> },
  ]),
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
      element: <LessonsPage />,
      handle: {
        page: { title: 'Lessons', description: 'Manage lessons' },
      },
    },
    {
      path: 'topics',
      element: <TopicsPage />,
      handle: {
        page: { title: 'Topics', description: 'Manage topics' },
      },
    },
    {
      path: 'manage',
      element: <ManageLessonPlanPage />,
      handle: {
        page: { title: 'Manage Lesson Plan', description: 'Manage lesson plan' },
      },
    },
    {
      path: 'copy-old-lessons',
      element: <CopyOldLessonsPage />,
      handle: {
        page: { title: 'Copy Old Lessons', description: 'Copy old lessons' },
      },
    },
  ]),
  createModuleRoutes('/online-examinations', ROUTES.onlineExams.exams, [
    { path: 'exams', element: <OnlineExamsPage /> },
    { path: 'question-bank', element: <QuestionBankPage /> },
  ]),
  createModuleRoutes('/income', ROUTES.income.list, [
    { path: 'list', element: <IncomeListPage /> },
    { path: 'heads', element: <IncomeHeadsPage /> },
    { path: 'search', element: <SearchIncomePage /> },
  ]),
  createModuleRoutes('/expense', ROUTES.expense.list, [
    { path: 'list', element: <ExpenseListPage /> },
    { path: 'heads', element: <ExpenseHeadsPage /> },
    { path: 'search', element: <SearchExpensePage /> },
  ]),
  createModuleRoutes('/finance', ROUTES.finance.chartOfAccounts, [
    { path: 'chart-of-accounts', element: <ChartOfAccountsPage /> },
    { path: 'ledgers', element: <LedgersPage /> },
    { path: 'groups', element: <LedgerGroupsPage /> },
    { path: 'entries', element: <JournalEntriesPage /> },
    { path: 'mapper', element: <FeeMapperPage /> },
    { path: 'reports', element: <FinanceReportsHubPage /> },
    { path: 'reports/trial-balance', element: <TrialBalancePage /> },
    { path: 'reports/balance-sheet', element: <BalanceSheetPage /> },
    { path: 'reports/profit-loss', element: <ProfitLossPage /> },
    { path: 'reports/ledger-statement', element: <LedgerStatementPage /> },
    { path: 'reports/ledger-entries', element: <LedgerEntriesPage /> },
    { path: 'reports/reconciliation', element: <ReconciliationPage /> },
  ]),
  createModuleRoutes('/reports', ROUTES.reports.students, [
    { path: 'students', element: <StudentReportPage /> },
    { path: 'attendance', element: <AttendanceReportPage /> },
    { path: 'fees', element: <FeesReportPage /> },
    { path: 'examinations', element: <ExamReportPage /> },
    { path: 'finance', element: <IncomeExpenseReportPage /> },
    { path: 'hr', element: <StaffReportPage /> },
    { path: 'transport', element: <TransportHostelReportPage /> },
    { path: 'library', element: <LibraryReportPage /> },
    { path: 'inventory', element: <InventoryReportPage /> },
    { path: 'homework', element: <HomeworkReportPage /> },
    { path: 'alumni', element: <AlumniReportPage /> },
    { path: 'lesson-plan', element: <LessonPlanReportPage /> },
    { path: 'user-log', element: <UserLogReportPage /> },
    { path: 'audit-trail', element: <AuditTrailReportPage /> },
    { path: 'online-exams', element: <OnlineExamReportPage /> },
    {
      path: 'timetable',
      element: <TimetableReportPage />,
      handle: {
        page: {
          title: 'Timetable Report',
          description: 'View Class Timetable Report.',
          module: 'Reports',
        },
      },
    },
  ]),
  createModuleRoutes('/certificates', ROUTES.certificates.templates, [
    { path: 'templates', element: <CertificateTemplatesPage /> },
    { path: 'generate', element: <GenerateCertificatePage /> },
    { path: 'student-id-card', element: <StudentIdCardTemplatesPage /> },
    { path: 'generate-id-card', element: <GenerateStudentIdCardPage /> },
    { path: 'staff-id-card', element: <StaffIdCardTemplatesPage /> },
    { path: 'generate-staff-id-card', element: <GenerateStaffIdCardPage /> },
  ]),
  createModuleRoutes('/alumni', ROUTES.alumni.list, [
    { path: 'list', element: <AlumniListPage /> },
    { path: 'events', element: <AlumniEventsPage /> },
  ]),
  createModuleRoutes('/leads', ROUTES.leads.all, [
    { path: 'all', element: <LeadsPage /> },
    { path: 'managed', element: <LeadsPage /> },
    { path: 'unmanaged', element: <LeadsPage /> },
    { path: 'campaigns', element: <CampaignsPage /> },
    { path: 'campaign-types', element: <CampaignTypesPage /> },
    { path: 'promoters', element: <PromotersPage /> },
    { path: 'follow-up-status', element: <FollowupStatusPage /> },
    { path: 'follow-ups', element: <FollowupsPage /> },
    { path: 'reports', element: <LeadReportsPage /> },
    { path: 'promoter-commission-report', element: <LeadReportsPage /> },
    { path: 'brief-reports', element: <LeadReportsPage /> },
    { path: 'call-reports', element: <LeadReportsPage /> },
    { path: 'travel-reports', element: <LeadReportsPage /> },
  ]),
  createModuleRoutes('/cms', ROUTES.cms.events, [
    { path: 'events', element: <CmsEventsPage /> },
    { path: 'gallery', element: <CmsGalleryPage /> },
    { path: 'notices', element: <CmsNoticesPage /> },
    { path: 'media', element: <CmsMediaPage /> },
    { path: 'pages', element: <CmsPagesPage /> },
    { path: 'menus', element: <CmsMenusPage /> },
    { path: 'banners', element: <CmsBannersPage /> },
    { path: 'settings', element: <CmsSettingsPage /> },
  ]),
  createModuleRoutes('/behaviour', '/behaviour/studentincidents', [
    { path: 'studentincidents', element: <AssignIncidentPage /> },
    { path: 'incidents', element: <IncidentsPage /> },
    { path: 'report', element: <IncidentReportsPage /> },
    { path: 'setting', element: <IncidentSettingPage /> },
  ]),
];
