import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface PackStatStripProps {
  children: ReactNode;
  className?: string;
}

/** Optional context line above filters (e.g. enrollment counts). */
export function PackStatStrip({ children, className }: PackStatStripProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PackStatItemProps {
  label?: string;
  value: ReactNode;
  className?: string;
}

export function PackStatItem({ label, value, className }: PackStatItemProps) {
  return (
    <span className={className}>
      {label ? (
        <>
          <span className="font-medium tabular-nums text-foreground">{value}</span> {label}
        </>
      ) : (
        value
      )}
    </span>
  );
}
