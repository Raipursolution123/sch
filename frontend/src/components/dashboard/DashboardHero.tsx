import { Link } from 'react-router-dom';
import { cn } from '@utils/cn';

interface DashboardHeroProps {
  greeting: string;
  dateLabel: string;
  schoolLabel?: string;
  sessionLabel?: string;
  roleLabel?: string;
  /** Lead KPI figure shown as the Stat-Led hero number. */
  leadValue: string;
  leadLabel: string;
  leadQualifier: string;
  primaryAction?: { label: string; to: string };
  secondaryAction?: { label: string; to: string };
  className?: string;
}

function parseLeadFigure(leadValue: string): {
  figure: string;
  unit: string | null;
  isEmpty: boolean;
} {
  const numeric = leadValue.replace(/[^\d.]/g, '');
  if (!numeric) {
    return { figure: '—', unit: null, isEmpty: true };
  }
  const unit = leadValue.replace(/[\d.,\s]/g, '').trim();
  return { figure: numeric, unit: unit || null, isEmpty: false };
}

/** Stat-Led operations lead — greeting + giant figure + actions (shell-v1). */
export function DashboardHero({
  greeting,
  dateLabel,
  schoolLabel,
  sessionLabel,
  roleLabel,
  leadValue,
  leadLabel,
  leadQualifier,
  primaryAction,
  secondaryAction,
  className,
}: DashboardHeroProps) {
  const { figure, unit, isEmpty } = parseLeadFigure(leadValue);

  return (
    <header className={cn('hm-ops-header hm-reveal', className)}>
      <div className="hm-ops-header__greet">
        <div className="min-w-0">
          <p className="hm-label">{dateLabel}</p>
          <h1 id="dashboard-hero-heading" className="hm-ops-header__title">
            {greeting}
          </h1>
          <p className="hm-ops-header__meta">
            {[roleLabel, schoolLabel, sessionLabel ? `Session ${sessionLabel}` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      <section className="hm-ops-lead" aria-labelledby="lead-metric-label">
        <div className="hm-ops-lead__copy">
          <p id="lead-metric-label" className="hm-label">
            {leadLabel}
          </p>
          <p
            className={cn(
              'hm-ops-lead__figure hm-tick hm-tnum',
              isEmpty && 'hm-ops-lead__figure--empty',
            )}
            aria-hidden="true"
          >
            {figure}
            {unit ? <span className="hm-ops-lead__unit">{unit}</span> : null}
          </p>
          <span className="sr-only">
            {leadLabel}: {leadValue}
          </span>
          <p className="hm-ops-lead__qualifier">{leadQualifier}</p>
        </div>
        {(primaryAction || secondaryAction) && (
          <div className="hm-ops-lead__actions">
            {primaryAction ? (
              <Link to={primaryAction.to} className="hm-btn hm-btn--primary">
                {primaryAction.label}
              </Link>
            ) : null}
            {secondaryAction ? (
              <Link to={secondaryAction.to} className="hm-btn hm-btn--ghost">
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </header>
  );
}

/** Shell-v1 ops stamp: "Tuesday · 25 Jul 2026 · 09:40 IST" */
export function getTodayLabel(date: Date = new Date()): string {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const calendar = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const clock = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });
  return `${weekday} · ${calendar} · ${clock}`;
}
