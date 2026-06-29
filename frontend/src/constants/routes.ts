export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  settings: {
    root: '/settings',
    sessions: '/settings/sessions',
    general: '/settings/general',
    languages: '/settings/languages',
    currency: '/settings/currency',
  },
  academics: {
    root: '/academics',
    classes: '/academics/classes',
    sections: '/academics/sections',
    classSections: '/academics/class-sections',
    subjects: '/academics/subjects',
  },
  students: {
    root: '/students',
    detail: (id: number) => `/students/${id}`,
  },
  staff: {
    root: '/staff',
    detail: (id: number) => `/staff/${id}`,
  },
  fees: {
    root: '/fees',
    feeTypes: '/fees/fee-types',
    feeGroups: '/fees/fee-groups',
    assign: '/fees/assign',
  },
  attendance: {
    root: '/attendance',
    mark: '/attendance/mark',
    report: '/attendance/report',
  },
  examinations: {
    root: '/examinations',
    groups: '/examinations/groups',
    exams: '/examinations/exams',
    schedule: '/examinations/schedule',
  },
  notFound: '*',
} as const;
