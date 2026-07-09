import type { WorkflowPackDefinition } from './types';

/** Catalog of school ERP workflow packs — compose primitives, don't invent UI. */
export const WORKFLOW_PACKS: WorkflowPackDefinition[] = [
  {
    id: 'admissions',
    name: 'Admissions',
    description: 'Multi-step admission wizard with document capture and approval.',
    priority: 'P0',
    layout: 'wizard',
    primitives: ['EntityFormDialog', 'FormField', 'ApprovalActionBar', 'PermissionButton'],
    modules: ['students'],
  },
  {
    id: 'students-profile',
    name: 'Students / Guardians',
    description: 'Profile tabs with overview, academic, guardians, and fees panels.',
    priority: 'P0',
    layout: 'profile',
    primitives: ['PageHeader', 'DataTable', 'FormField', 'PermissionButton'],
    modules: ['students'],
  },
  {
    id: 'attendance-mark',
    name: 'Attendance — Mark',
    description: 'Class/section filter bar with editable attendance grid.',
    priority: 'P0',
    layout: 'mark-grid',
    primitives: ['PageHeader', 'FormField', 'DataTable', 'PermissionButton'],
    modules: ['attendance'],
  },
  {
    id: 'attendance-report',
    name: 'Attendance — Report',
    description: 'Date-range report with summary KPIs, print, and CSV export.',
    priority: 'P0',
    layout: 'report',
    primitives: ['ReportHeader', 'ReportFilterBar', 'DataTable'],
    modules: ['attendance'],
  },
  {
    id: 'fees-assign',
    name: 'Fees — Assign',
    description: 'Assign fee groups to classes with line-item amounts.',
    priority: 'P0',
    layout: 'list',
    primitives: ['PageHeader', 'DataTable', 'EntityFormDialog', 'PermissionButton'],
    modules: ['fees'],
  },
  {
    id: 'exams-publish',
    name: 'Exams — Publish',
    description: 'Exam schedule table with publication approval workflow.',
    priority: 'P1',
    layout: 'workflow',
    primitives: ['DataTable', 'ApprovalActionBar', 'StatusPipeline', 'PermissionButton'],
    modules: ['examinations'],
  },
  {
    id: 'reports-settings',
    name: 'Reports / Settings',
    description: 'Report kit and settings forms for school configuration.',
    priority: 'P1',
    layout: 'report',
    primitives: ['ReportHeader', 'FormField', 'SettingsCard', 'PermissionButton'],
    modules: ['settings', 'reports'],
  },
];

export function getWorkflowPack(id: string): WorkflowPackDefinition | undefined {
  return WORKFLOW_PACKS.find((pack) => pack.id === id);
}

export function getPacksByModule(module: string): WorkflowPackDefinition[] {
  return WORKFLOW_PACKS.filter((pack) => pack.modules.includes(module));
}
