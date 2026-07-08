import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Briefcase,
  CalendarCheck,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import { SETTINGS_NAV } from './settings-nav';
import { ACADEMICS_NAV } from './academics-nav';
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
    sessions: '/academics/sessions/',
    sessionDetail: (id: number) => `/academics/sessions/${id}/`,
    sessionActivate: (id: number) => `/academics/sessions/${id}/activate/`,
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
    documentUpload: (id: number) => `/staff/${id}/documents/upload/`,
    documentDelete: (id: number) => `/staff/${id}/documents/delete/`,
  },
  fees: {
    categories: '/fees/categories/',
    categoryDetail: (id: number) => `/fees/categories/${id}/`,
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

export type NavSection = 'main' | 'people' | 'operations' | 'system';

export interface NavItem {
  label: string;
  path?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  section?: NavSection;
  children?: NavItem[];
}

export const NAV_SECTION_LABELS: Record<Exclude<NavSection, 'main'>, string> = {
  people: 'PEOPLE',
  operations: 'OPERATIONS',
  system: 'SYSTEM',
};

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.dashboard, icon: LayoutDashboard, section: 'main' },
  { label: 'Students', path: ROUTES.students.root, icon: Users, section: 'people' },
  { label: 'Staff', path: ROUTES.staff.root, icon: Briefcase, section: 'people' },
  {
    label: 'Academics',
    path: ROUTES.academics.root,
    icon: GraduationCap,
    section: 'operations',
    children: [...ACADEMICS_NAV],
  },
  { label: 'Fees', path: ROUTES.fees.feeTypes, icon: IndianRupee, section: 'operations' },
  { label: 'Attendance', path: ROUTES.attendance.mark, icon: CalendarCheck, section: 'operations' },
  { label: 'Examinations', path: ROUTES.examinations.exams, icon: BookOpen, section: 'operations' },
  {
    label: 'Settings',
    path: ROUTES.settings.root,
    icon: Settings,
    section: 'system',
    children: [...SETTINGS_NAV],
  },
];
