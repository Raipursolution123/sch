import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Max width constraint for list/form pages. */
  size?: 'default' | 'wide' | 'full';
}

const sizeClasses = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

/** Standard page content wrapper — consistent spacing and max-width. */
export function PageContainer({ children, className, size = 'wide' }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full space-y-6', sizeClasses[size], className)}>{children}</div>
  );
}
