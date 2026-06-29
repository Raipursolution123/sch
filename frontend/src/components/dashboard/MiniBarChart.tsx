import { memo } from 'react';
import { cn } from '@utils/cn';

export interface BarChartPoint {
  label: string;
  value: number;
}

interface MiniBarChartProps {
  data: BarChartPoint[];
  maxValue?: number;
  valueSuffix?: string;
  ariaLabel: string;
  className?: string;
}

/** Accessible CSS bar chart for dashboard summaries. */
export const MiniBarChart = memo(function MiniBarChart({
  data,
  maxValue,
  valueSuffix = '%',
  ariaLabel,
  className,
}: MiniBarChartProps) {
  const peak = maxValue ?? Math.max(...data.map((point) => point.value), 1);

  return (
    <div className={cn('space-y-4', className)} role="group" aria-label={ariaLabel}>
      <div className="flex h-40 items-end gap-2 sm:gap-3">
        {data.map((point) => {
          const height = Math.max(8, (point.value / peak) * 100);

          return (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {point.value}
                {valueSuffix}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary/80 to-primary transition-all duration-300 hover:from-primary hover:to-primary/90"
                  style={{ height: `${height}%` }}
                  role="img"
                  aria-label={`${point.label}: ${point.value}${valueSuffix}`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
