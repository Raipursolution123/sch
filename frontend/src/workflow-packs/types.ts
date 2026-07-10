export type WorkflowPackPriority = 'P0' | 'P1' | 'P2';

export type WorkflowPackPrimitive =
  | 'AppShell'
  | 'PageHeader'
  | 'DataTable'
  | 'FormField'
  | 'EntityFormDialog'
  | 'ReportHeader'
  | 'ReportFilterBar'
  | 'PermissionButton'
  | 'ApprovalActionBar'
  | 'StatusPipeline'
  | 'NotificationCenter'
  | 'SettingsCard';

export interface WorkflowPackDefinition {
  id: string;
  name: string;
  description: string;
  priority: WorkflowPackPriority;
  primitives: WorkflowPackPrimitive[];
  layout: 'list' | 'profile' | 'mark-grid' | 'report' | 'wizard' | 'workflow';
  modules: string[];
}
