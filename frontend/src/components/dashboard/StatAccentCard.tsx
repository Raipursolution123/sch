import { cn } from '@utils/cn';

interface StatAccentCardProps {
  label: string;
  value: string;
  changePercent?: number;
  changeLabel?: string;
  /** Kept for API compatibility; Cobalt uses a single accent. */
  accentTone?: string;
  className?: string;
}

/** Supporting KPI cell in the hairline strip. */
export function StatAccentCard({
  label,
  value,
  changePercent,
  changeLabel,
  className,
}: StatAccentCardProps) {
  const isEmpty = value === '—' || value.trim() === '';
  const trend =
    changePercent != null && changeLabel != null
      ? {
          up: changePercent >= 0,
          text: `${changePercent >= 0 ? '+' : ''}${changePercent}% ${changeLabel}`,
        }
      : null;

  return (
    <article className={cn('hm-kpi-cell', className)}>
      <p className="hm-label">{label}</p>
      <p className={cn('hm-kpi-cell__value hm-tnum', isEmpty && 'is-empty')}>{value}</p>
      {trend ? (
        <p className={cn('hm-kpi-cell__trend', trend.up ? 'is-up' : 'is-down')}>{trend.text}</p>
      ) : (
        <p className="hm-kpi-cell__hint">{isEmpty ? 'Not configured' : 'Active session'}</p>
      )}
    </article>
  );
}
