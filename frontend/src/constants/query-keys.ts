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
    notificationSettings: {
      all: ['settings', 'notification-settings'] as const,
      list: (page: number, search: string) =>
        [...queryKeys.settings.notificationSettings.all, 'list', page, search] as const,
    },
    smsConfig: {
      all: ['settings', 'sms-config'] as const,
      list: (page: number) => [...queryKeys.settings.smsConfig.all, 'list', page] as const,
    },
    emailConfig: {
      all: ['settings', 'email-config'] as const,
      list: (page: number) => [...queryKeys.settings.emailConfig.all, 'list', page] as const,
    },
    paymentMethods: {
      all: ['settings', 'payment-methods'] as const,
      list: (page: number) => [...queryKeys.settings.paymentMethods.all, 'list', page] as const,
    },
    printHeaderFooter: {
      all: ['settings', 'print-header-footer'] as const,
      list: (page: number) => [...queryKeys.settings.printHeaderFooter.all, 'list', page] as const,
    },
    roles: {
      all: ['settings', 'roles'] as const,
      list: (page: number) => [...queryKeys.settings.roles.all, 'list', page] as const,
      detail: (id: number) => [...queryKeys.settings.roles.all, 'detail', id] as const,
    },
    users: {
      all: ['settings', 'users'] as const,
      list: (page: number, q: string) =>
        [...queryKeys.settings.users.all, 'list', page, q] as const,
      detail: (id: number) => [...queryKeys.settings.users.all, 'detail', id] as const,
      roleOptions: () => [...queryKeys.settings.users.all, 'role-options'] as const,
    },
    modules: {
      all: ['settings', 'modules'] as const,
      list: (page: number, search: string) =>
        [...queryKeys.settings.modules.all, 'list', page, search] as const,
    },
    customFields: {
      all: ['settings', 'custom-fields'] as const,
      list: (page: number, search: string, belongTo: string) =>
        [...queryKeys.settings.customFields.all, 'list', page, search, belongTo] as const,
    },
    captcha: {
      all: ['settings', 'captcha'] as const,
      list: (page: number) => [...queryKeys.settings.captcha.all, 'list', page] as const,
    },
    systemFields: {
      all: ['settings', 'system-fields'] as const,
      detail: () => [...queryKeys.settings.systemFields.all, 'detail'] as const,
    },
    onlineAdmissionSettings: {
      all: ['settings', 'online-admission-settings'] as const,
      detail: () => [...queryKeys.settings.onlineAdmissionSettings.all, 'detail'] as const,
    },
    onlineAdmissionFields: {
      all: ['settings', 'online-admission-fields'] as const,
      list: (page: number) =>
        [...queryKeys.settings.onlineAdmissionFields.all, 'list', page] as const,
    },
    sidebarMenus: {
      all: ['settings', 'sidebar-menus'] as const,
      list: (page: number) => [...queryKeys.settings.sidebarMenus.all, 'list', page] as const,
    },
    sidebarSubmenus: {
      all: ['settings', 'sidebar-submenus'] as const,
      list: (page: number, menuId: number | null) =>
        [...queryKeys.settings.sidebarSubmenus.all, 'list', page, menuId] as const,
    },
    fileTypes: {
      all: ['settings', 'file-types'] as const,
      detail: () => [...queryKeys.settings.fileTypes.all, 'detail'] as const,
    },
    backups: {
      all: ['settings', 'backups'] as const,
      list: () => [...queryKeys.settings.backups.all, 'list'] as const,
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
    subjectGroups: {
      all: ['academics', 'subject-groups'] as const,
      list: (sessionId?: number) =>
        [...queryKeys.academics.subjectGroups.all, 'list', sessionId ?? 'all'] as const,
      detail: (id: number) => [...queryKeys.academics.subjectGroups.all, 'detail', id] as const,
    },
    timetable: {
      all: ['academics', 'timetable'] as const,
      grid: (sessionId?: number, classId?: number, sectionId?: number) =>
        [
          ...queryKeys.academics.timetable.all,
          'grid',
          sessionId ?? 'all',
          classId ?? 'all',
          sectionId ?? 'all',
        ] as const,
      subjectOptions: (sessionId?: number, classId?: number, sectionId?: number) =>
        [
          ...queryKeys.academics.timetable.all,
          'subject-options',
          sessionId ?? 'all',
          classId ?? 'all',
          sectionId ?? 'all',
        ] as const,
    },
    teacherTimetable: {
      all: ['academics', 'teacher-timetable'] as const,
      grid: (sessionId?: number, staffId?: number) =>
        [
          ...queryKeys.academics.teacherTimetable.all,
          'grid',
          sessionId ?? 'all',
          staffId ?? 'all',
        ] as const,
    },
    classTeachers: {
      all: ['academics', 'class-teachers'] as const,
      list: (sessionId?: number, classId?: number, sectionId?: number) =>
        [
          ...queryKeys.academics.classTeachers.all,
          'list',
          sessionId ?? 'all',
          classId ?? 'all',
          sectionId ?? 'all',
        ] as const,
    },
    promote: {
      all: ['academics', 'promote'] as const,
      preview: (params: {
        from_session_id: number;
        from_class_id: number;
        from_section_id: number;
        to_session_id: number;
        to_class_id: number;
        to_section_id: number;
      }) =>
        [
          ...queryKeys.academics.promote.all,
          'preview',
          params.from_session_id,
          params.from_class_id,
          params.from_section_id,
          params.to_session_id,
          params.to_class_id,
          params.to_section_id,
        ] as const,
    },
    sessions: {
      all: ['academics', 'sessions'] as const,
      list: (page: number) => [...queryKeys.academics.sessions.all, 'list', page] as const,
      active: () => [...queryKeys.academics.sessions.all, 'active'] as const,
      detail: (id: number) => [...queryKeys.academics.sessions.all, 'detail', id] as const,
    },
  },
  students: {
    all: ['students'] as const,
    list: (status: 'active' | 'disabled' | 'all' = 'active') =>
      [...queryKeys.students.all, 'list', status] as const,
    detail: (id: number) => [...queryKeys.students.all, 'detail', id] as const,
    fees: (id: number) => [...queryKeys.students.all, 'fees', id] as const,
    transport: (id: number) => [...queryKeys.students.all, 'transport', id] as const,
    suggestAdmissionNo: () => [...queryKeys.students.all, 'suggest-admission-no'] as const,
    disableReasons: () => [...queryKeys.students.all, 'disable-reasons'] as const,
    categories: {
      all: ['students', 'categories'] as const,
      list: (query = '') => [...queryKeys.students.categories.all, 'list', query] as const,
    },
    houses: {
      all: ['students', 'houses'] as const,
      list: (query = '') => [...queryKeys.students.houses.all, 'list', query] as const,
    },
    importTemplate: () => [...queryKeys.students.all, 'import-template'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (page?: number) => [...queryKeys.staff.all, 'list', ...(page ? [page] : [])] as const,
    detail: (id: number) => [...queryKeys.staff.all, 'detail', id] as const,
    departments: () => [...queryKeys.staff.all, 'departments'] as const,
    designations: () => [...queryKeys.staff.all, 'designations'] as const,
    suggestEmployeeId: () => [...queryKeys.staff.all, 'suggest-employee-id'] as const,
    attendance: {
      types: () => [...queryKeys.staff.all, 'attendance', 'types'] as const,
      roster: (date: string) => [...queryKeys.staff.all, 'attendance', 'roster', date] as const,
    },
    payroll: {
      scales: () => [...queryKeys.staff.all, 'payroll', 'scales'] as const,
      payslips: (staffId?: number) =>
        [...queryKeys.staff.all, 'payroll', 'payslips', staffId ?? 'all'] as const,
    },
    leaveTypes: {
      list: () => [...queryKeys.staff.all, 'leave-types', 'list'] as const,
    },
    leaveRequests: {
      list: () => [...queryKeys.staff.all, 'leave-requests', 'list'] as const,
    },
    leaveAllotments: {
      roster: (staffId: number) =>
        [...queryKeys.staff.all, 'leave-allotments', 'roster', staffId] as const,
    },
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
    discounts: {
      list: () => [...queryKeys.fees.all, 'discounts', 'list'] as const,
    },
    discountAssignments: {
      all: () => [...queryKeys.fees.all, 'discount-assignments'] as const,
      roster: (classId: number, sectionId: number, feesDiscountId: number) =>
        [
          ...queryKeys.fees.all,
          'discount-assignments',
          'roster',
          classId,
          sectionId,
          feesDiscountId,
        ] as const,
    },
    reminders: {
      list: () => [...queryKeys.fees.all, 'reminders', 'list'] as const,
    },
    paymentGateways: {
      list: () => [...queryKeys.fees.all, 'payment-gateways', 'list'] as const,
    },
    offlinePayments: {
      all: ['fees', 'offline-payments'] as const,
      list: (filters: {
        status?: string;
        from_date?: string;
        to_date?: string;
        q?: string;
        page?: number;
      }) =>
        [
          'fees',
          'offline-payments',
          'list',
          filters.status ?? 'pending',
          filters.from_date ?? '',
          filters.to_date ?? '',
          filters.q ?? '',
          filters.page ?? 1,
        ] as const,
    },
    assignments: {
      list: () => [...queryKeys.fees.all, 'assignments', 'list'] as const,
    },
    studentAssignments: {
      roster: (feeSessionGroupId: number, sectionId?: number) =>
        [
          ...queryKeys.fees.all,
          'student-assignments',
          feeSessionGroupId,
          sectionId ?? 'all',
        ] as const,
    },
    carryForward: {
      preview: (fromSessionId: number, toSessionId: number, classId: number, sectionId: number) =>
        [
          ...queryKeys.fees.all,
          'carry-forward',
          fromSessionId,
          toSessionId,
          classId,
          sectionId,
        ] as const,
    },
    collect: {
      roster: (classId: number, sectionId: number) =>
        [...queryKeys.fees.all, 'collect', 'roster', classId, sectionId] as const,
    },
    search: {
      due: (filters: {
        class_id?: number;
        section_id?: number;
        q?: string;
        min_balance?: number;
      }) =>
        [
          ...queryKeys.fees.all,
          'search',
          'due',
          filters.class_id ?? 'all',
          filters.section_id ?? 'all',
          filters.q ?? '',
          filters.min_balance ?? 'default',
        ] as const,
      payments: (filters: {
        from_date: string;
        to_date: string;
        class_id?: number;
        section_id?: number;
        q?: string;
        payment_mode?: string;
      }) =>
        [
          ...queryKeys.fees.all,
          'search',
          'payments',
          filters.from_date,
          filters.to_date,
          filters.class_id ?? 'all',
          filters.section_id ?? 'all',
          filters.q ?? '',
          filters.payment_mode ?? 'all',
        ] as const,
    },
  },
  transport: {
    all: ['transport'] as const,
    fees: (sessionId?: number) => [...queryKeys.transport.all, 'fees', sessionId ?? 'all'] as const,
    pickupPoints: () => [...queryKeys.transport.all, 'pickup-points'] as const,
    routes: () => [...queryKeys.transport.all, 'routes'] as const,
    vehicles: () => [...queryKeys.transport.all, 'vehicles'] as const,
    vehicleRoutes: () => [...queryKeys.transport.all, 'vehicle-routes'] as const,
    routePickupPoints: (routeId?: number) =>
      [...queryKeys.transport.all, 'route-pickup-points', routeId ?? 'all'] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    types: () => [...queryKeys.attendance.all, 'types'] as const,
    roster: (classId: number, sectionId: number, date: string) =>
      [...queryKeys.attendance.all, 'roster', classId, sectionId, date] as const,
    subjectPeriods: (classId: number, sectionId: number, date: string) =>
      [...queryKeys.attendance.all, 'subject-periods', classId, sectionId, date] as const,
    subjectRoster: (periodId: number, date: string) =>
      [...queryKeys.attendance.all, 'subject-roster', periodId, date] as const,
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
    grades: {
      list: () => [...queryKeys.examinations.all, 'grades', 'list'] as const,
    },
    divisions: {
      list: () => [...queryKeys.examinations.all, 'divisions', 'list'] as const,
    },
    results: {
      all: () => [...queryKeys.examinations.all, 'results'] as const,
      roster: (examId: number, scheduleId: number) =>
        [...queryKeys.examinations.all, 'results', 'roster', examId, scheduleId] as const,
    },
    enrollments: {
      all: () => [...queryKeys.examinations.all, 'enrollments'] as const,
      roster: (examId: number, classId: number, sectionId: number) =>
        [
          ...queryKeys.examinations.all,
          'enrollments',
          'roster',
          examId,
          classId,
          sectionId,
        ] as const,
    },
    cbseExams: {
      list: () => [...queryKeys.examinations.all, 'cbse-exams', 'list'] as const,
    },
    admitCards: {
      list: () => [...queryKeys.examinations.all, 'admit-cards', 'list'] as const,
    },
    marksheets: {
      list: () => [...queryKeys.examinations.all, 'marksheets', 'list'] as const,
    },
  },
  hostel: {
    all: ['hostel'] as const,
    hostels: {
      list: () => [...queryKeys.hostel.all, 'hostels', 'list'] as const,
    },
    rooms: {
      list: (hostelId?: number) =>
        [...queryKeys.hostel.all, 'rooms', 'list', hostelId ?? 'all'] as const,
    },
    roomTypes: {
      list: () => [...queryKeys.hostel.all, 'room-types', 'list'] as const,
    },
  },
  communications: {
    all: ['communications'] as const,
    notices: {
      list: () => [...queryKeys.communications.all, 'notices', 'list'] as const,
    },
    messages: {
      all: ['communications', 'messages'] as const,
      list: (channel?: string) =>
        [...queryKeys.communications.all, 'messages', 'list', channel ?? 'all'] as const,
    },
  },
  frontOffice: {
    all: ['front-office'] as const,
    enquiries: {
      list: () => [...queryKeys.frontOffice.all, 'enquiries', 'list'] as const,
    },
    visitors: {
      list: () => [...queryKeys.frontOffice.all, 'visitors', 'list'] as const,
    },
    visitorPurposes: {
      list: () => [...queryKeys.frontOffice.all, 'visitor-purposes', 'list'] as const,
    },
    phoneCalls: {
      list: () => [...queryKeys.frontOffice.all, 'phone-calls', 'list'] as const,
    },
    complaints: {
      list: () => [...queryKeys.frontOffice.all, 'complaints', 'list'] as const,
    },
    postal: {
      list: (type?: string) =>
        [...queryKeys.frontOffice.all, 'postal', 'list', type ?? 'all'] as const,
    },
  },
  admissions: {
    all: ['admissions'] as const,
    online: {
      list: () => [...queryKeys.admissions.all, 'online', 'list'] as const,
    },
  },
  homework: {
    all: ['homework'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.homework.all, 'list', filters] as const,
    daily: {
      list: (filters: Record<string, unknown>) =>
        [...queryKeys.homework.all, 'daily', 'list', filters] as const,
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
  finance: {
    all: ['finance'] as const,
    entryTypes: () => [...queryKeys.finance.all, 'entry-types'] as const,
    entries: {
      all: ['finance', 'entries'] as const,
      list: (page: number) => [...queryKeys.finance.entries.all, 'list', page] as const,
      detail: (id: number) => [...queryKeys.finance.entries.all, 'detail', id] as const,
    },
    mapper: {
      all: ['finance', 'mapper'] as const,
      list: () => [...queryKeys.finance.mapper.all, 'list'] as const,
    },
    reports: {
      all: ['finance', 'reports'] as const,
      index: () => [...queryKeys.finance.reports.all, 'index'] as const,
      trialBalance: (from = '', to = '') =>
        [...queryKeys.finance.reports.all, 'trial-balance', from, to] as const,
      balanceSheet: (asOf = '') =>
        [...queryKeys.finance.reports.all, 'balance-sheet', asOf] as const,
      profitLoss: (from = '', to = '') =>
        [...queryKeys.finance.reports.all, 'profit-loss', from, to] as const,
      ledgerStatement: (ledgerId: number, from = '', to = '') =>
        [...queryKeys.finance.reports.all, 'ledger-statement', ledgerId, from, to] as const,
      ledgerEntries: (ledgerId = 0, from = '', to = '') =>
        [...queryKeys.finance.reports.all, 'ledger-entries', ledgerId, from, to] as const,
      reconciliation: (ledgerId = 0) =>
        [...queryKeys.finance.reports.all, 'reconciliation', ledgerId] as const,
    },
  },
  alumni: {
    all: ['alumni'] as const,
    students: {
      list: (query = '') => [...queryKeys.alumni.all, 'students', 'list', query] as const,
    },
    events: {
      list: (query = '') => [...queryKeys.alumni.all, 'events', 'list', query] as const,
    },
    report: {
      list: (query = '') => [...queryKeys.alumni.all, 'report', 'list', query] as const,
    },
  },
  leads: {
    all: ['leads'] as const,
    list: (query = '', campaignId = '') =>
      [...queryKeys.leads.all, 'list', query, campaignId] as const,
    campaigns: {
      list: (query = '') => [...queryKeys.leads.all, 'campaigns', 'list', query] as const,
    },
    followupStatuses: {
      list: (query = '') => [...queryKeys.leads.all, 'followup-statuses', 'list', query] as const,
    },
    followups: {
      list: (query = '', leadId = '') =>
        [...queryKeys.leads.all, 'followups', 'list', query, leadId] as const,
    },
    sources: {
      list: () => [...queryKeys.leads.all, 'sources', 'list'] as const,
    },
    promoters: {
      list: () => [...queryKeys.leads.all, 'promoters', 'list'] as const,
    },
    report: () => [...queryKeys.leads.all, 'report'] as const,
  },
  cms: {
    all: ['cms'] as const,
    events: {
      list: (query = '') => [...queryKeys.cms.all, 'events', 'list', query] as const,
    },
    gallery: {
      list: (query = '') => [...queryKeys.cms.all, 'gallery', 'list', query] as const,
    },
    media: {
      list: (query = '') => [...queryKeys.cms.all, 'media', 'list', query] as const,
    },
    notices: {
      list: (query = '') => [...queryKeys.cms.all, 'notices', 'list', query] as const,
    },
    pages: {
      list: (query = '') => [...queryKeys.cms.all, 'pages', 'list', query] as const,
    },
    menus: {
      list: (query = '') => [...queryKeys.cms.all, 'menus', 'list', query] as const,
    },
    banners: {
      list: (query = '') => [...queryKeys.cms.all, 'banners', 'list', query] as const,
    },
    settings: () => [...queryKeys.cms.all, 'settings'] as const,
  },
  library: {
    all: ['library'] as const,
    books: {
      list: (query = '') => [...queryKeys.library.all, 'books', 'list', query] as const,
    },
    issues: {
      list: (status = 'open', query = '') =>
        [...queryKeys.library.all, 'issues', 'list', status, query] as const,
    },
    members: {
      list: () => [...queryKeys.library.all, 'members', 'list'] as const,
    },
  },
  inventory: {
    all: ['inventory'] as const,
    categories: {
      list: (query = '') => [...queryKeys.inventory.all, 'categories', 'list', query] as const,
    },
    stores: {
      list: (query = '') => [...queryKeys.inventory.all, 'stores', 'list', query] as const,
    },
    suppliers: {
      list: (query = '') => [...queryKeys.inventory.all, 'suppliers', 'list', query] as const,
    },
    items: {
      list: (query = '') => [...queryKeys.inventory.all, 'items', 'list', query] as const,
    },
    stock: {
      list: (query = '') => [...queryKeys.inventory.all, 'stock', 'list', query] as const,
    },
    issues: {
      list: (status = 'open', query = '') =>
        [...queryKeys.inventory.all, 'issues', 'list', status, query] as const,
    },
  },
  incomeExpense: {
    all: ['income-expense'] as const,
    incomeHeads: {
      list: () => [...queryKeys.incomeExpense.all, 'income-heads', 'list'] as const,
    },
    income: {
      list: (query = '') => [...queryKeys.incomeExpense.all, 'income', 'list', query] as const,
    },
    expenseHeads: {
      list: () => [...queryKeys.incomeExpense.all, 'expense-heads', 'list'] as const,
    },
    expense: {
      list: (query = '') => [...queryKeys.incomeExpense.all, 'expense', 'list', query] as const,
    },
  },
  certificates: {
    all: ['certificates'] as const,
    templates: {
      list: (query = '') => [...queryKeys.certificates.all, 'templates', 'list', query] as const,
    },
  },
  idCards: {
    all: ['id-cards'] as const,
    student: {
      list: (query = '') => [...queryKeys.idCards.all, 'student', 'list', query] as const,
    },
    staff: {
      list: (query = '') => [...queryKeys.idCards.all, 'staff', 'list', query] as const,
    },
  },
  downloadCenter: {
    all: ['download-center'] as const,
    contentTypes: {
      list: (query = '') =>
        [...queryKeys.downloadCenter.all, 'content-types', 'list', query] as const,
    },
    content: {
      list: (query = '') => [...queryKeys.downloadCenter.all, 'content', 'list', query] as const,
    },
    videos: {
      list: (query = '') => [...queryKeys.downloadCenter.all, 'videos', 'list', query] as const,
    },
  },
  onlineExams: {
    all: ['online-exams'] as const,
    questions: {
      list: (query = '') => [...queryKeys.onlineExams.all, 'questions', 'list', query] as const,
    },
    exams: {
      list: (query = '') => [...queryKeys.onlineExams.all, 'exams', 'list', query] as const,
      questions: (examId: number) =>
        [...queryKeys.onlineExams.all, 'exams', examId, 'questions'] as const,
      roster: (examId: number, classId: number, sectionId: number) =>
        [...queryKeys.onlineExams.all, 'exams', examId, 'roster', classId, sectionId] as const,
    },
  },
} as const;
