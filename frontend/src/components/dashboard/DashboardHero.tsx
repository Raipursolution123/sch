import { cn } from '@utils/cn';

interface DashboardHeroProps {
  greeting: string;
  dateLabel: string;
  sessionLabel?: string;
  className?: string;
}

/** Top-of-page greeting — flat, premium admin chrome. */
export function DashboardHero({
  greeting,
  dateLabel,
  sessionLabel,
  className,
}: DashboardHeroProps) {
  return (
    <section className={cn('space-y-1', className)} aria-labelledby="dashboard-hero-heading">
      <h1
        id="dashboard-hero-heading"
        className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        {greeting}
      </h1>
      <p className="text-sm text-muted-foreground">
        {dateLabel}
        {sessionLabel ? ` · Session ${sessionLabel}` : ''}
      </p>
    </section>
  );
}

export function getTodayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
