import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface DashboardCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  padding?: 'default' | 'none';
}

/** Shared card shell for dashboard sections — update styling here app-wide. */
export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  padding = 'default',
}: DashboardCardProps) {
  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-heading`;

  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
      aria-labelledby={headingId}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/80 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 id={headingId} className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn(padding === 'default' && 'p-5 sm:p-6', contentClassName)}>{children}</div>
    </section>
  );
}
