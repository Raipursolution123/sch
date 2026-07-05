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

export function SettingsCard({
  title,
  description,
  children,
  footer,
  action,
  className,
}: SettingsCardProps) {
  return (
    <section
      className={cn('rounded-lg border bg-card shadow-sm', className)}
      aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
    >
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2
            id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
            className="text-base font-semibold text-foreground"
          >
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="space-y-4 p-6">{children}</div>
      {footer && <div className="flex justify-end border-t bg-muted/30 px-6 py-4">{footer}</div>}
    </section>
  );
}
