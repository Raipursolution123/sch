import type { ReactNode } from 'react';
import { cn } from '@utils/cn';

/** Shared panel surface — matches workflow-packs-v1 / shell-v1 card chrome. */
export const packPanelClassName =
  'overflow-hidden rounded-panel border border-border bg-card shadow-sm';

interface PackPanelProps {
  children: ReactNode;
  className?: string;
  /** Inner padding preset. */
  padding?: 'none' | 'sm' | 'md';
  as?: 'div' | 'section';
}

const paddingClass = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
} as const;

export function PackPanel({
  children,
  className,
  padding = 'none',
  as: Tag = 'div',
}: PackPanelProps) {
  return <Tag className={cn(packPanelClassName, paddingClass[padding], className)}>{children}</Tag>;
}
