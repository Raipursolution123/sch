import type { ReactNode } from 'react';
import { PageHeader } from '@components/layout/PageHeader';
import { EmptyState } from '@components/feedback/EmptyState';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { getApiErrorMessage } from '@utils/error-message';

interface ModuleListPackProps {
  title: string;
  description?: string;
  actions?: ReactNode;
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
}

/**
 * Standard list module shell: header + async states + DataTable slot.
 *
 * When `isEmpty` is true the empty state is shown instead of the table.
 * Children are still mounted (hidden) so create/edit dialogs kept inside
 * `children` continue to work — prefer `footer` or siblings for overlays.
 */
export function ModuleListPack({
  title,
  description,
  actions,
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
}: ModuleListPackProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} actions={actions} />

      {prerequisiteHint}

      {isLoading && <LoadingState message={loadingMessage} />}

      {isError && (
        <ErrorState message={getApiErrorMessage(error, 'Could not load data')} onRetry={onRetry} />
      )}

      {!isLoading && !isError && isEmpty && (
        <>
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
          {/* Keep dialogs/overlays in the tree while the list is empty. */}
          {children ? (
            <div className="hidden" aria-hidden="true">
              {children}
            </div>
          ) : null}
        </>
      )}

      {!isLoading && !isError && !isEmpty && children}

      {footer}
    </div>
  );
}
