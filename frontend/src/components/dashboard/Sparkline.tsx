import { memo } from 'react';
import { cn } from '@utils/cn';

interface SparklineProps {
  values: number[];
  className?: string;
  ariaLabel: string;
}

/** Lightweight SVG sparkline — no chart library required. */
export const Sparkline = memo(function Sparkline({ values, className, ariaLabel }: SparklineProps) {
  if (values.length < 2) return null;

  const width = 96;
  const height = 32;
  const padding = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-8 w-24 text-primary', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
});
