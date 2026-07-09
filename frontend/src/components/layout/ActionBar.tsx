import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface ActionBarProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'between';
}

const alignClasses = {
  start: 'justify-start',
  end: 'justify-end',
  between: 'justify-between',
};

/** Sticky or inline action row for page-level primary/secondary actions. */
export function ActionBar({ children, className, align = 'end' }: ActionBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        alignClasses[align],
        className,
      )}
    >
      {children}
    </div>
  );
}
