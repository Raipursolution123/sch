import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Dense configuration panel — hairline border, no card shadow (Cobalt Workbench). */
export function SettingsCard({
  title,
  description,
  children,
  footer,
  action,
  className,
}: SettingsCardProps) {
  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-heading`;

  return (
    <section
      className={cn('rounded-panel border border-border bg-card', className)}
      aria-labelledby={headingId}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 id={headingId} className="text-sm font-semibold text-foreground">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="space-y-3 p-4 sm:p-5">{children}</div>
      {footer && (
        <div className="flex justify-end border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          {footer}
        </div>
      )}
    </section>
  );
}
