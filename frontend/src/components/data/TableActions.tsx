import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface TableActionsProps {
  children: ReactNode;
  className?: string;
}

/** Consistent right-aligned action button group for DataTable rows. */
export function TableActions({ children, className }: TableActionsProps) {
  return <div className={cn('flex justify-end gap-1', className)}>{children}</div>;
}
