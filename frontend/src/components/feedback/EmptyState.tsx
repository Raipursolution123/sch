import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@utils/cn';

interface EmptyStateProps {
  /** What is empty — e.g. "No students enrolled yet." */
  title: string;
  /** Why it matters / what happens next. */
  description?: string;
  /** One clear action — e.g. Create button. */
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Three-beat empty state: what's empty → why it matters → one action.
 */
export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start rounded-panel border border-dashed border-border bg-card px-6 py-10 sm:items-center sm:text-center',
        className,
      )}
      role="status"
    >
      <div className="mb-3 text-muted-foreground" aria-hidden="true">
        {icon ?? <Inbox className="h-8 w-8" />}
      </div>
      <h3 className="font-display text-base font-medium tracking-display text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
