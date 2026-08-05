import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-border text-foreground',
        success: 'border-transparent bg-success-pale text-success-deep',
        warning: 'border-transparent bg-warning/20 text-warning-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
        pending: 'border-transparent bg-warning/20 text-warning-foreground',
        overdue: 'border-transparent bg-destructive/15 text-destructive',
        published: 'border-transparent bg-primary-pale text-ink',
        draft: 'border-border bg-card text-muted-foreground',
        info: 'border-transparent bg-primary-pale text-ink',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
