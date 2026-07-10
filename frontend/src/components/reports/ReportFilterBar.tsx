import type { ReactNode } from 'react';
import { Button } from '@components/ui/button';
import { cn } from '@utils/cn';

interface ReportFilterBarProps {
  children: ReactNode;
  sessionLabel?: string;
  onApply?: () => void;
  applyLabel?: string;
  applyDisabled?: boolean;
  className?: string;
}

/** Shared filter chrome for operational reports. */
export function ReportFilterBar({
  children,
  sessionLabel,
  onApply,
  applyLabel = 'Apply filters',
  applyDisabled,
  className,
}: ReportFilterBarProps) {
  return (
    <div
      className={cn('no-print rounded-lg border border-border/80 bg-card p-4 shadow-sm', className)}
    >
      {sessionLabel && (
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Session: <span className="text-foreground">{sessionLabel}</span>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{children}</div>
      {onApply && (
        <div className="mt-4 flex justify-end border-t border-border/60 pt-4">
          <Button type="button" onClick={onApply} disabled={applyDisabled}>
            {applyLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
