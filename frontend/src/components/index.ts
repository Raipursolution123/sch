/** Shared feedback components (loading, empty, error states). */
export { EmptyState } from './feedback/EmptyState';
export { ErrorBoundary } from './feedback/ErrorBoundary';
export { ErrorState } from './feedback/ErrorState';
export { LoadingState } from './feedback/LoadingState';
export { Spinner } from './feedback/Spinner';
export { StatusBadge } from './feedback/StatusBadge';

/** Shared form/layout helpers. */
export { EntityFormDialog } from './forms/EntityFormDialog';
export { FormAutosaveIndicator } from './forms/FormAutosaveIndicator';
export { FormErrorSummary } from './forms/FormErrorSummary';
export { FormField, getFormFieldA11yProps } from './forms/FormField';
export { FormSection } from './forms/FormSection';
export { FormGrid } from './forms/FormGrid';
export { SettingsCard } from './forms/SettingsCard';
export * from './forms/fields';

/** Application chrome. */
export { AdminSidebar } from './layout/AdminSidebar';
export { AppShell } from './layout/AppShell';
export { ActionBar } from './layout/ActionBar';
export { Breadcrumbs } from './layout/Breadcrumbs';
export { FilterBar, SearchBar } from './layout/FilterBar';
export { ModuleSwitcher } from './layout/ModuleSwitcher';
export { NotificationsBell } from './layout/NotificationsBell';
export { NotificationCenter } from './layout/NotificationCenter';
export { PageContainer } from './layout/PageContainer';
export { PageHeader } from './layout/PageHeader';
export { ModuleSubNavLayout } from './layout/ModuleSubNavLayout';
export type { ModuleNavItem } from './layout/ModuleSubNavLayout';
export { SessionChip } from './layout/SessionChip';
export { ThemeToggle } from './layout/ThemeToggle';
export { TopBar } from './layout/TopBar';

/** Overlays. */
export { ConfirmDestructiveDialog } from './overlays/ConfirmDestructiveDialog';
export { ConfirmDialog } from './overlays/ConfirmDialog';

/** RBAC — permission gates and field access. */
export * from './rbac';

/** Workflows — approval pipelines and audit. */
export * from './workflows';

/** Reports kit — printable operational reports. */
export * from './reports';

/** Data display. */
export { DataTable } from './data/DataTable';
export type { DataTableColumn, DataTableDensity, DataTableProps } from './data/DataTable';
export type { DataTablePaginationConfig } from './data/data-table-types';
export { DataTableBulkBar } from './data/DataTableBulkBar';
export { DataTablePagination } from './data/DataTablePagination';
export { DataTableSkeleton } from './data/DataTableSkeleton';
export { DataTableToolbar } from './data/DataTableToolbar';
export { TableActions } from './data/TableActions';

/** Workflow packs — composable module layouts. */
export * from '@workflow-packs';
