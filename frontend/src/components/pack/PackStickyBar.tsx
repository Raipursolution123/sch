import type { ReactNode } from 'react';
import { PackPanel } from '@components/pack/PackPanel';
import { cn } from '@utils/cn';

interface PackStickyBarProps {
  children: ReactNode;
  className?: string;
}

/** Sticky confirmation bar for mark grids and multi-step saves. */
export function PackStickyBar({ children, className }: PackStickyBarProps) {
  return (
    <PackPanel
      className={cn(
        'sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 border-primary/20 px-4 py-3',
        className,
      )}
    >
      {children}
    </PackPanel>
  );
}
