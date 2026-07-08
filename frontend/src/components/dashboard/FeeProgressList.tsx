import { cn } from '@utils/cn';
import { formatAmount } from '@utils/format';

interface FeeProgressItem {
  label: string;
  amount: number;
  tone: 'success' | 'warning' | 'destructive';
}

interface FeeProgressListProps {
  items: FeeProgressItem[];
  total: number;
  collectionRate: number;
  className?: string;
}

const toneClasses = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  destructive: 'bg-destructive',
} as const;

/** Horizontal progress breakdown for fee collection overview. */
export function FeeProgressList({ items, total, collectionRate, className }: FeeProgressListProps) {
  if (total <= 0) {
    return <FeeProgressEmpty className={className} />;
  }

  return (
    <div className={cn('space-y-5', className)}>
      <div>
        <div className="mb-2 flex items-end justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">Collection rate</span>
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {collectionRate.toFixed(1)}%
          </span>
        </div>
        <div
          className="flex h-2.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={collectionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Fee collection rate"
        >
          {items.map((item) => {
            const width = total > 0 ? (item.amount / total) * 100 : 0;
            return (
              <div
                key={item.label}
                className={cn('h-full transition-all', toneClasses[item.tone])}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={cn('h-2.5 w-2.5 rounded-full', toneClasses[item.tone])}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <span className="font-medium text-foreground">{formatAmount(item.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeeProgressEmpty({ className }: { className?: string }) {
  return (
    <div className={cn('py-10 text-center text-sm text-muted-foreground', className)}>
      Fee collection summary is not available until the school-wide fees API is connected.
    </div>
  );
}
