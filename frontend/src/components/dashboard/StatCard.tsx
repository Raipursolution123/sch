import type { LucideIcon } from 'lucide-react';
import { cn } from '@utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: React.ReactNode;
  className?: string;
}

/** Lightweight KPI card for dashboards and summary rows. */
export function StatCard({ label, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-pale text-ink">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
      {trend && <div className="mt-3">{trend}</div>}
    </article>
  );
}
