import type { ReactNode } from 'react';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';

interface ModuleMarkGridPackProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  prerequisiteHint?: ReactNode;
  filters: ReactNode;
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
}

/** Mark/register grid shell: header + filter bar + editable table slot. */
export function ModuleMarkGridPack({
  title,
  description,
  actions,
  prerequisiteHint,
  filters,
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
}: ModuleMarkGridPackProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} actions={actions} />

      {prerequisiteHint}

      <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-3">{filters}</div>

      {filtersReady && isLoading && <LoadingState message={loadingMessage} />}

      {filtersReady && isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load data'}
          onRetry={onRetry}
        />
      )}

      {filtersReady && !isLoading && !isError && isEmpty && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {filtersReady && !isLoading && !isError && !isEmpty && children}
    </div>
  );
}
