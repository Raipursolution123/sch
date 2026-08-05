import type { ReactNode } from 'react';
import { PackPanel, packPanelClassName } from '@components/pack/PackPanel';
import { cn } from '@utils/cn';

/** Filter / search toolbar in a pack panel — list & report modules. */
export function PackFilterPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <PackPanel className={cn('p-4', className)}>{children}</PackPanel>;
}

/** Class name alias for inline filter bars outside PackFilterPanel. */
export { packPanelClassName };
