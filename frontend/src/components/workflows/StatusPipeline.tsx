import type { WorkflowStatus } from '@app-types/workflow';
import { cn } from '@utils/cn';

const STEPS: { key: WorkflowStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
];

interface StatusPipelineProps {
  status: WorkflowStatus;
  className?: string;
}

const statusIndex: Record<WorkflowStatus, number> = {
  draft: 0,
  submitted: 1,
  approved: 2,
  rejected: 1,
};

export function StatusPipeline({ status, className }: StatusPipelineProps) {
  const activeIndex = statusIndex[status];

  return (
    <ol className={cn('flex flex-wrap items-center gap-2', className)} aria-label="Approval status">
      {STEPS.map((step, index) => {
        const isComplete = index < activeIndex || (status === 'approved' && index <= activeIndex);
        const isCurrent =
          (status === 'rejected' && step.key === 'submitted') ||
          (status !== 'rejected' && index === activeIndex);
        const isRejected = status === 'rejected' && step.key === 'submitted';

        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                isRejected && isCurrent && 'bg-destructive/10 text-destructive',
                isCurrent && !isRejected && 'bg-primary-pale text-ink',
                isComplete && !isCurrent && 'bg-success-pale text-success-deep',
                !isComplete && !isCurrent && 'bg-muted text-muted-foreground',
              )}
            >
              {isRejected && isCurrent ? 'Rejected' : step.label}
            </span>
            {index < STEPS.length - 1 && (
              <span className="text-muted-foreground" aria-hidden="true">
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
