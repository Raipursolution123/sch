import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface FormGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

/** Responsive form field grid — pairs with FormSection. */
export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  return <div className={cn('grid gap-4', columnClasses[columns], className)}>{children}</div>;
}
