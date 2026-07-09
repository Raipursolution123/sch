import type { ReactNode } from 'react';
import { EmptyState } from '@components/feedback/EmptyState';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { cn } from '@utils/cn';

interface ChartPanelProps {
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingMessage?: string;
  className?: string;
}

/** Chart wrapper with loading, error, and empty states for dashboard widgets. */
export function ChartPanel({
  children,
  isLoading,
  isError,
  errorMessage = 'Could not load chart data',
  onRetry,
  isEmpty,
  emptyTitle = 'No data yet',
  emptyDescription = 'Data will appear here once records are available.',
  loadingMessage = 'Loading chart…',
  className,
}: ChartPanelProps) {
  if (isLoading) {
    return (
      <div className={cn('min-h-[10rem]', className)}>
        <LoadingState message={loadingMessage} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('min-h-[10rem]', className)}>
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn('min-h-[10rem] py-4', className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

interface ChartPanelInlineEmptyProps {
  message: string;
  className?: string;
}

export function ChartPanelInlineEmpty({ message, className }: ChartPanelInlineEmptyProps) {
  return (
    <p className={cn('py-10 text-center text-sm text-muted-foreground', className)}>{message}</p>
  );
}
