export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  settings: {
    sessions: {
      all: ['settings', 'sessions'] as const,
      list: (page: number) => [...queryKeys.settings.sessions.all, 'list', page] as const,
      active: () => [...queryKeys.settings.sessions.all, 'active'] as const,
      detail: (id: number) => [...queryKeys.settings.sessions.all, 'detail', id] as const,
    },
    general: {
      all: ['settings', 'general'] as const,
      detail: () => [...queryKeys.settings.general.all, 'detail'] as const,
    },
    languages: {
      all: ['settings', 'languages'] as const,
      list: (page: number) => [...queryKeys.settings.languages.all, 'list', page] as const,
      detail: (id: number) => [...queryKeys.settings.languages.all, 'detail', id] as const,
    },
    currencies: {
      all: ['settings', 'currencies'] as const,
      list: (page: number) => [...queryKeys.settings.currencies.all, 'list', page] as const,
      detail: (id: number) => [...queryKeys.settings.currencies.all, 'detail', id] as const,
    },
  },
  academics: {
    classes: {
      all: ['academics', 'classes'] as const,
      list: () => [...queryKeys.academics.classes.all, 'list'] as const,
      detail: (id: number) => [...queryKeys.academics.classes.all, 'detail', id] as const,
      suggestSortOrder: () => [...queryKeys.academics.classes.all, 'suggest-sort-order'] as const,
    },
    sections: {
      all: ['academics', 'sections'] as const,
      list: () => [...queryKeys.academics.sections.all, 'list'] as const,
      detail: (id: number) => [...queryKeys.academics.sections.all, 'detail', id] as const,
    },
    classSections: {
      all: ['academics', 'class-sections'] as const,
      list: () => [...queryKeys.academics.classSections.all, 'list'] as const,
      detail: (id: number) => [...queryKeys.academics.classSections.all, 'detail', id] as const,
    },
    subjects: {
      all: ['academics', 'subjects'] as const,
      list: () => [...queryKeys.academics.subjects.all, 'list'] as const,
      detail: (id: number) => [...queryKeys.academics.subjects.all, 'detail', id] as const,
    },
  },
  students: {
    all: ['students'] as const,
    list: () => [...queryKeys.students.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.students.all, 'detail', id] as const,
    fees: (id: number) => [...queryKeys.students.all, 'fees', id] as const,
    suggestAdmissionNo: () => [...queryKeys.students.all, 'suggest-admission-no'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (page?: number) => [...queryKeys.staff.all, 'list', ...(page ? [page] : [])] as const,
    detail: (id: number) => [...queryKeys.staff.all, 'detail', id] as const,
    departments: () => [...queryKeys.staff.all, 'departments'] as const,
    designations: () => [...queryKeys.staff.all, 'designations'] as const,
    suggestEmployeeId: () => [...queryKeys.staff.all, 'suggest-employee-id'] as const,
  },
  fees: {
    all: ['fees'] as const,
    categories: () => [...queryKeys.fees.all, 'categories'] as const,
    feeTypes: {
      list: () => [...queryKeys.fees.all, 'fee-types', 'list'] as const,
    },
    feeGroups: {
      list: () => [...queryKeys.fees.all, 'fee-groups', 'list'] as const,
    },
    assignments: {
      list: () => [...queryKeys.fees.all, 'assignments', 'list'] as const,
    },
  },
  attendance: {
    all: ['attendance'] as const,
    types: () => [...queryKeys.attendance.all, 'types'] as const,
    roster: (classId: number, sectionId: number, date: string) =>
      [...queryKeys.attendance.all, 'roster', classId, sectionId, date] as const,
    report: (filters: {
      from_date: string;
      to_date: string;
      class_id?: number;
      section_id?: number;
    }) =>
      [
        ...queryKeys.attendance.all,
        'report',
        filters.from_date,
        filters.to_date,
        filters.class_id ?? 'all',
        filters.section_id ?? 'all',
      ] as const,
    approveLeave: {
      all: ['attendance', 'approve-leave'] as const,
      list: () => [...queryKeys.attendance.approveLeave.all, 'list'] as const,
      detail: (id: string) => [...queryKeys.attendance.approveLeave.all, 'detail', id] as const,
    },
  },
  examinations: {
    all: ['examinations'] as const,
    groups: {
      list: () => [...queryKeys.examinations.all, 'groups', 'list'] as const,
    },
    exams: {
      list: () => [...queryKeys.examinations.all, 'exams', 'list'] as const,
    },
    schedules: {
      list: () => [...queryKeys.examinations.all, 'schedules', 'list'] as const,
    },
  },
  dashboard: {
    all: ['dashboard'] as const,
    overview: () => [...queryKeys.dashboard.all, 'overview'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (sessionId: number | null) =>
      [...queryKeys.notifications.all, 'list', sessionId] as const,
  },
  workflows: {
    all: ['workflows'] as const,
    record: (entityType: string, entityId: number) =>
      [...queryKeys.workflows.all, entityType, entityId] as const,
    exams: () => [...queryKeys.workflows.all, 'exam'] as const,
  },
} as const;
