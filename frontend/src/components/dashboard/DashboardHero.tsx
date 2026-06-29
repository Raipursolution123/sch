import { CalendarDays, Sparkles } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { cn } from '@utils/cn';

interface DashboardHeroProps {
  greeting: string;
  subtitle: string;
  sessionLabel?: string;
  className?: string;
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Top-of-page hero banner — greeting, date, and session context. */
export function DashboardHero({ greeting, subtitle, sessionLabel, className }: DashboardHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm sm:p-8',
        className,
      )}
      aria-labelledby="dashboard-hero-heading"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-chart-2/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Admin overview
          </div>
          <h1
            id="dashboard-hero-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {greeting}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-normal">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {getTodayLabel()}
          </Badge>
          {sessionLabel && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 font-normal">
              Session: {sessionLabel}
            </Badge>
          )}
        </div>
      </div>
    </section>
  );
}
