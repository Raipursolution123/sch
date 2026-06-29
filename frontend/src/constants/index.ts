import { SETTINGS_NAV } from './settings-nav';
import { ACADEMICS_NAV } from './academics-nav';
import { FEES_NAV } from './fees-nav';
import { ATTENDANCE_NAV } from './attendance-nav';
import { EXAMINATIONS_NAV } from './examinations-nav';
import { ROUTES } from './routes';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    logout: '/auth/logout/',
    me: '/auth/me/',
    tokenRefresh: '/auth/token/refresh/',
  },
  settings: {
    // TODO: Wire when backend exposes academic session endpoints
    sessions: '/settings/sessions/',
    sessionDetail: (id: number) => `/settings/sessions/${id}/`,
    sessionActivate: (id: number) => `/settings/sessions/${id}/activate/`,
    // TODO: Wire when backend exposes general settings endpoints
    general: '/settings/general/',
    // TODO: Wire when backend exposes languages endpoints
    languages: '/settings/languages/',
    languageDetail: (id: number) => `/settings/languages/${id}/`,
    // TODO: Wire when backend exposes currencies endpoints
    currencies: '/settings/currencies/',
    currencyDetail: (id: number) => `/settings/currencies/${id}/`,
    currencyActivate: (id: number) => `/settings/currencies/${id}/activate/`,
  },
  academics: {
    // TODO: Wire when backend exposes classes endpoints
    classes: '/academics/classes/',
    classDetail: (id: number) => `/academics/classes/${id}/`,
    // TODO: Wire when backend exposes sections endpoints
    sections: '/academics/sections/',
    sectionDetail: (id: number) => `/academics/sections/${id}/`,
    // TODO: Wire when backend exposes class-sections endpoints
    classSections: '/academics/class-sections/',
    classSectionDetail: (id: number) => `/academics/class-sections/${id}/`,
    // TODO: Wire when backend exposes subjects endpoints
    subjects: '/academics/subjects/',
    subjectDetail: (id: number) => `/academics/subjects/${id}/`,
  },
  students: {
    // TODO: Wire when backend exposes student endpoints
    list: '/students/',
    detail: (id: number) => `/students/${id}/`,
    fees: (id: number) => `/students/${id}/fees/`,
  },
  staff: {
    // TODO: Wire when backend exposes staff endpoints
    list: '/staff/',
    detail: (id: number) => `/staff/${id}/`,
    departments: '/staff/departments/',
    designations: '/staff/designations/',
  },
  fees: {
    // TODO: Wire when backend exposes fees endpoints
    categories: '/fees/categories/',
    feeTypes: '/fees/fee-types/',
    feeTypeDetail: (id: number) => `/fees/fee-types/${id}/`,
    feeGroups: '/fees/fee-groups/',
    feeGroupDetail: (id: number) => `/fees/fee-groups/${id}/`,
    assignments: '/fees/assignments/',
    assignmentDetail: (id: number) => `/fees/assignments/${id}/`,
  },
  attendance: {
    // TODO: Wire when backend exposes attendance endpoints
    types: '/attendance/types/',
    roster: '/attendance/roster/',
    mark: '/attendance/mark/',
    report: '/attendance/report/',
  },
  examinations: {
    // TODO: Wire when backend exposes examinations endpoints
    groups: '/examinations/groups/',
    groupDetail: (id: number) => `/examinations/groups/${id}/`,
    exams: '/examinations/exams/',
    examDetail: (id: number) => `/examinations/exams/${id}/`,
    schedules: '/examinations/schedules/',
    scheduleDetail: (id: number) => `/examinations/schedules/${id}/`,
  },
  health: '/health/',
} as const;

export { ROUTES } from './routes';

export const STORAGE_KEYS = {
  accessToken: 'school_erp_access_token',
  refreshToken: 'school_erp_refresh_token',
} as const;

export interface NavItem {
  label: string;
  path?: string;
  disabled?: boolean;
  children?: NavItem[];
}

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.dashboard },
  {
    label: 'Settings',
    path: ROUTES.settings.root,
    children: [...SETTINGS_NAV],
  },
  {
    label: 'Academics',
    path: ROUTES.academics.root,
    children: [...ACADEMICS_NAV],
  },
  { label: 'Students', path: ROUTES.students.root },
  { label: 'Staff', path: ROUTES.staff.root },
  {
    label: 'Fees',
    path: ROUTES.fees.root,
    children: [...FEES_NAV],
  },
  {
    label: 'Attendance',
    path: ROUTES.attendance.root,
    children: [...ATTENDANCE_NAV],
  },
  {
    label: 'Examinations',
    path: ROUTES.examinations.root,
    children: [...EXAMINATIONS_NAV],
  },
];
