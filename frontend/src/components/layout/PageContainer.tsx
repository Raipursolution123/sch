import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Max width constraint for list/form pages. */
  size?: 'default' | 'wide' | 'full' | 'narrow' | 'pack';
}

const sizeClasses = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  /** Shell-v1 / workflow-packs content width (72rem). */
  pack: 'max-w-[72rem]',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

/** Standard page content wrapper — consistent spacing and max-width. */
export function PageContainer({ children, className, size = 'pack' }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full space-y-6 pb-2', sizeClasses[size], className)}>
      {children}
    </div>
  );
}
