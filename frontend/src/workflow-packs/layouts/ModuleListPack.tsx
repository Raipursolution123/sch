import type { ReactNode } from 'react';
import { PageContainer } from '@components/layout/PageContainer';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { getApiErrorMessage } from '@utils/error-message';

interface ModuleListPackProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Optional stat strip between header and filters (e.g. enrollment counts). */
  stats?: ReactNode;
  /** Filter / search panel above the table slot. */
  filters?: ReactNode;
  prerequisiteHint?: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Skip PageContainer when already wrapped by a parent shell. */
  bare?: boolean;
}

/**
 * Standard list module shell: header + optional stats/filters + async states + table slot.
 *
 * When `isEmpty` is true the empty state is shown instead of the table.
 * Children are still mounted (hidden) so create/edit dialogs kept inside
 * `children` continue to work — prefer `footer` or siblings for overlays.
 */
export function ModuleListPack({
  title,
  description,
  actions,
  stats,
  filters,
  prerequisiteHint,
  isLoading,
  loadingMessage = 'Loading…',
  isError,
  error,
  onRetry,
  isEmpty,
  emptyTitle = 'No records found',
  emptyDescription,
  emptyAction,
  children,
  footer,
  bare = false,
}: ModuleListPackProps) {
  const body = (
    <>
      <PageHeader title={title} description={description} actions={actions} />

      {prerequisiteHint}

      {stats}

      {filters}

      {isLoading && <LoadingState message={loadingMessage} />}

      {isError && (
        <ErrorState message={getApiErrorMessage(error, 'Could not load data')} onRetry={onRetry} />
      )}

      {!isLoading && !isError && isEmpty && (
        <>
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
          {children ? (
            <div className="hidden" aria-hidden="true">
              {children}
            </div>
          ) : null}
        </>
      )}

      {!isLoading && !isError && !isEmpty && children}

      {footer}
    </>
  );

  if (bare) {
    return <div className="space-y-6">{body}</div>;
  }

  return <PageContainer size="pack">{body}</PageContainer>;
}
