import { memo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@utils/cn';

interface TrendBadgeProps {
  value: number;
  label: string;
  className?: string;
}

/** Compact trend indicator for KPI cards. */
export const TrendBadge = memo(function TrendBadge({ value, label, className }: TrendBadgeProps) {
  const isPositive = value >= 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
        className,
      )}
      aria-label={`${isPositive ? 'Up' : 'Down'} ${Math.abs(value)} percent ${label}`}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
      )}
      <span>
        {isPositive ? '+' : ''}
        {value}%
      </span>
      <span className="font-normal text-muted-foreground">{label}</span>
    </div>
  );
});
