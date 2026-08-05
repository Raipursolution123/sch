import { memo } from 'react';
import { cn } from '@utils/cn';

interface MetricTrendProps {
  value: number;
  label: string;
  className?: string;
}

/** Inline trend for KPI cells — mono readout, cobalt on lift. */
export const MetricTrend = memo(function MetricTrend({
  value,
  label,
  className,
}: MetricTrendProps) {
  const isPositive = value >= 0;

  return (
    <p
      className={cn(
        'font-mono text-xs font-medium tracking-label',
        isPositive ? 'text-primary' : 'text-destructive',
        className,
      )}
      aria-label={`${isPositive ? 'Up' : 'Down'} ${Math.abs(value)} percent ${label}`}
    >
      {isPositive ? '+' : ''}
      {value}% {label}
    </p>
  );
});
