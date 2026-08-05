import type { ReactNode } from 'react';
import { PageContainer } from '@components/layout/PageContainer';
import { PageHeader } from '@components/layout/PageHeader';
import { FilterBar } from '@components/layout/FilterBar';
import { PackGridToolbar } from '@components/pack/PackGridToolbar';
import { PackStickyBar } from '@components/pack/PackStickyBar';
import { EmptyState } from '@components/feedback/EmptyState';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { getApiErrorMessage } from '@utils/error-message';

interface ModuleMarkGridPackProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  prerequisiteHint?: ReactNode;
  filters: ReactNode;
  filterActions?: ReactNode;
  /** Toolbar above the grid (e.g. bulk mark). */
  gridToolbar?: ReactNode;
  /** Sticky save bar under the grid. */
  stickyActions?: ReactNode;
  filtersReady?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children?: ReactNode;
  bare?: boolean;
  filterColumns?: 2 | 3 | 4 | 5;
}

/** Mark/register grid shell: header + FilterBar + editable table slot. */
export function ModuleMarkGridPack({
  title,
  description,
  actions,
  prerequisiteHint,
  filters,
  filterActions,
  gridToolbar,
  stickyActions,
  filtersReady = true,
  isLoading,
  loadingMessage = 'Loading…',
  isError,
  error,
  onRetry,
  isEmpty,
  emptyTitle = 'No records found',
  emptyDescription,
  children,
  bare = false,
  filterColumns = 3,
}: ModuleMarkGridPackProps) {
  const showGrid = filtersReady && !isLoading && !isError && !isEmpty;

  const body = (
    <>
      <PageHeader title={title} description={description} actions={actions} />

      {prerequisiteHint}

      <FilterBar layout="grid" columns={filterColumns} actions={filterActions}>
        {filters}
      </FilterBar>

      {filtersReady && isLoading && <LoadingState message={loadingMessage} />}

      {filtersReady && isError && (
        <ErrorState message={getApiErrorMessage(error, 'Could not load data')} onRetry={onRetry} />
      )}

      {filtersReady && !isLoading && !isError && isEmpty && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {showGrid && gridToolbar}

      {showGrid && children}

      {showGrid && stickyActions ? <PackStickyBar>{stickyActions}</PackStickyBar> : null}
    </>
  );

  if (bare) {
    return <div className="space-y-6">{body}</div>;
  }

  return <PageContainer size="pack">{body}</PageContainer>;
}

/** Re-export for pages composing custom grid toolbars. */
export { PackGridToolbar, PackStickyBar };
