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
  /** Graphite dark band (Cobalt signature). */
  variant?: 'default' | 'band';
}

/** Section shell for dashboard modules — hairline panel, no drop shadow. */
export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  padding = 'default',
  variant = 'default',
}: DashboardCardProps) {
  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-heading`;

  return (
    <section
      className={cn(variant === 'band' ? 'hm-band' : 'hm-section', 'hm-reveal', className)}
      aria-labelledby={headingId}
    >
      <div className="hm-section__head">
        <div className="min-w-0">
          <h2 id={headingId} className="hm-section__title">
            {title}
          </h2>
          {description ? <p className="hm-section__desc">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn(padding === 'default' && 'hm-section__body', contentClassName)}>
        {children}
      </div>
    </section>
  );
}
