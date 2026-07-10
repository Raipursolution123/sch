import { cn } from '@utils/cn';

export interface ReportSummaryItem {
  label: string;
  value: string | number;
  tone?: 'default' | 'success' | 'warning' | 'destructive';
}

interface ReportSummaryGridProps {
  items: ReportSummaryItem[];
  className?: string;
}

const toneClass = {
  default: 'text-foreground',
  success: 'text-success-deep',
  warning: 'text-warning-foreground',
  destructive: 'text-destructive',
} as const;

export function ReportSummaryGrid({ items, className }: ReportSummaryGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6', className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border/70 bg-card px-3 py-2.5 text-center shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
          <p
            className={cn(
              'mt-0.5 text-lg font-semibold tabular-nums',
              toneClass[item.tone ?? 'default'],
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
