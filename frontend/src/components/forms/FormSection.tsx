import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Groups related fields in long forms (admission, settings, profiles). */
export function FormSection({ title, description, children, className }: FormSectionProps) {
  const headingId = `${title.replace(/\s+/g, '-').toLowerCase()}-section`;

  return (
    <section className={cn('space-y-4', className)} aria-labelledby={headingId}>
      <div className="border-b border-border/70 pb-3">
        <h3 id={headingId} className="text-sm font-semibold text-foreground">
          {title}
        </h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
