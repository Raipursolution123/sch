import { memo } from 'react';
import { cn } from '@utils/cn';

interface MetricTrendProps {
  value: number;
  label: string;
  className?: string;
}

/** Inline trend line for KPI cards — matches reference dashboard style. */
export const MetricTrend = memo(function MetricTrend({
  value,
  label,
  className,
}: MetricTrendProps) {
  const isPositive = value >= 0;

  return (
    <p
      className={cn(
        'text-sm font-medium',
        isPositive ? 'text-success' : 'text-destructive',
        className,
      )}
      aria-label={`${isPositive ? 'Up' : 'Down'} ${Math.abs(value)} percent ${label}`}
    >
      {isPositive ? '+' : ''}
      {value}% {label}
    </p>
  );
});
