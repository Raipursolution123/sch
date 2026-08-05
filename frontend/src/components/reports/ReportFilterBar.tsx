import type { ReactNode } from 'react';
import { Button } from '@components/ui/button';
import { filterPanelClassName } from '@components/layout/FilterBar';
import { cn } from '@utils/cn';

interface ReportFilterBarProps {
  children: ReactNode;
  sessionLabel?: string;
  onApply?: () => void;
  applyLabel?: string;
  applyDisabled?: boolean;
  className?: string;
}

/** Shared filter chrome for operational reports — same panel language as FilterBar. */
export function ReportFilterBar({
  children,
  sessionLabel,
  onApply,
  applyLabel = 'Apply filters',
  applyDisabled,
  className,
}: ReportFilterBarProps) {
  return (
    <div className={cn('no-print', filterPanelClassName, className)}>
      {sessionLabel && (
        <p className="text-label mb-3 text-muted-foreground">
          Session{' '}
          <span className="font-mono normal-case tracking-normal text-foreground">
            {sessionLabel}
          </span>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{children}</div>
      {onApply && (
        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <Button type="button" onClick={onApply} disabled={applyDisabled}>
            {applyLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
