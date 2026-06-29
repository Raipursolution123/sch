import type { LucideIcon } from 'lucide-react';
import { cn } from '@utils/cn';
import { Sparkline } from '@components/dashboard/Sparkline';
import { TrendBadge } from '@components/dashboard/TrendBadge';

interface KpiStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  changePercent: number;
  changeLabel: string;
  sparkline?: number[];
  iconTone?: 'primary' | 'success' | 'warning' | 'neutral';
  className?: string;
}

const iconToneClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  neutral: 'bg-muted text-muted-foreground',
} as const;

/** Primary KPI widget — update layout and styling from this single component. */
export function KpiStatCard({
  label,
  value,
  icon: Icon,
  changePercent,
  changeLabel,
  sparkline,
  iconTone = 'primary',
  className,
}: KpiStatCardProps) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md sm:p-6',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            iconToneClasses[iconTone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {sparkline && (
          <Sparkline
            values={sparkline}
            ariaLabel={`${label} trend over recent period`}
            className="opacity-70 transition-opacity group-hover:opacity-100"
          />
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{value}</p>
      </div>

      <div className="mt-3">
        <TrendBadge value={changePercent} label={changeLabel} />
      </div>
    </article>
  );
}
