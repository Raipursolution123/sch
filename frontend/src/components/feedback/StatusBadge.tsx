import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils/cn';
import type { ActiveFlag } from '@app-types/settings/session';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        active: 'border-transparent bg-success-pale text-success-deep',
        inactive: 'border-transparent bg-muted text-muted-foreground',
        pending: 'border-transparent bg-warning/20 text-warning-foreground',
        overdue: 'border-transparent bg-destructive/15 text-destructive',
        published: 'border-transparent bg-primary-pale text-ink',
        draft: 'border border-border bg-card text-muted-foreground',
        success: 'border-transparent bg-success-pale text-success-deep',
        warning: 'border-transparent bg-warning/20 text-warning-foreground',
        danger: 'border-transparent bg-destructive/15 text-destructive',
        info: 'border-transparent bg-primary-pale text-ink',
      },
    },
    defaultVariants: {
      tone: 'inactive',
    },
  },
);

export type StatusTone = NonNullable<VariantProps<typeof statusBadgeVariants>['tone']>;

const STATUS_LABELS: Record<StatusTone, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  overdue: 'Overdue',
  published: 'Published',
  draft: 'Draft',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
  info: 'Info',
};

interface StatusBadgeProps {
  /** Legacy Active/Inactive flag from settings APIs. */
  isActive?: ActiveFlag;
  /** Explicit status tone for richer workflows. */
  status?: StatusTone;
  /** Override displayed label. */
  label?: string;
  className?: string;
}

export function StatusBadge({ isActive, status, label, className }: StatusBadgeProps) {
  const tone: StatusTone =
    status ?? (isActive === 'yes' ? 'active' : isActive != null ? 'inactive' : 'inactive');

  return (
    <span className={cn(statusBadgeVariants({ tone }), className)}>
      {label ?? STATUS_LABELS[tone]}
    </span>
  );
}
