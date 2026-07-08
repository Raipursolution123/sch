import { cn } from '@utils/cn';
import type { SoftTone } from '@utils/tone';
import { softToneAccentBar } from '@utils/tone';
import { MetricTrend } from '@components/dashboard/MetricTrend';

interface StatAccentCardProps {
  label: string;
  value: string;
  changePercent?: number;
  changeLabel?: string;
  accentTone?: SoftTone;
  className?: string;
}

/** KPI card with left accent bar — primary dashboard metric widget. */
export function StatAccentCard({
  label,
  value,
  changePercent,
  changeLabel,
  accentTone = 'primary',
  className,
}: StatAccentCardProps) {
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 sm:p-6',
        className,
      )}
    >
      <div
        className={cn(
          'absolute bottom-3 left-0 top-3 w-1.5 rounded-full',
          softToneAccentBar[accentTone],
        )}
        aria-hidden="true"
      />
      <div className="pl-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        {changeLabel != null && changePercent != null && (
          <div className="mt-2">
            <MetricTrend value={changePercent} label={changeLabel} />
          </div>
        )}
      </div>
    </article>
  );
}
