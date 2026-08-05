import type { ReactNode } from 'react';
import { PackPanel } from '@components/pack/PackPanel';
import { cn } from '@utils/cn';

interface PackGridToolbarProps {
  summary?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Toolbar strip above mark/register grids — counts + bulk shortcuts. */
export function PackGridToolbar({ summary, actions, children, className }: PackGridToolbarProps) {
  return (
    <PackPanel
      className={cn('flex flex-wrap items-center justify-between gap-3 px-4 py-3', className)}
    >
      {children ?? (
        <>
          {summary ? <div className="text-sm text-muted-foreground">{summary}</div> : null}
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </>
      )}
    </PackPanel>
  );
}
