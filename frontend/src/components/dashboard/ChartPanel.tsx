import type { ReactNode } from 'react';
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

/** Chart wrapper — empty states stay typographic (no nested dashed cards). */
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
      <div className={cn('hm-empty hm-empty--rich', className)} role="status">
        <p className="hm-empty__title">{emptyTitle}</p>
        {emptyDescription ? <p className="hm-empty__desc">{emptyDescription}</p> : null}
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
  return <p className={cn('hm-empty', className)}>{message}</p>;
}
