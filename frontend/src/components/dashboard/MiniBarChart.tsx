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

/** Cobalt bar chart — single accent + muted alternate columns. */
export const MiniBarChart = memo(function MiniBarChart({
  data,
  maxValue,
  valueSuffix = '%',
  ariaLabel,
  className,
}: MiniBarChartProps) {
  const peak = maxValue ?? Math.max(...data.map((point) => point.value), 1);

  if (data.length === 0) {
    return <p className={cn('hm-empty', className)}>No attendance data available yet.</p>;
  }

  return (
    <div className={cn('hm-bars', className)} role="group" aria-label={ariaLabel}>
      {data.map((point, index) => {
        const height = Math.max(4, (point.value / peak) * 100);

        return (
          <div key={point.label} className="hm-bars__col">
            <span className="hm-bars__val hm-tnum">
              {point.value}
              {valueSuffix}
            </span>
            <div className="hm-bars__track">
              <div
                className={cn('hm-bars__fill', index % 2 === 1 && 'is-alt')}
                style={{ height: `${height}%` }}
                role="img"
                aria-label={`${point.label}: ${point.value}${valueSuffix}`}
              />
            </div>
            <span className="hm-bars__label">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
});
