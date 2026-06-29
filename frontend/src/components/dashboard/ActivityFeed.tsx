import {
  BookOpen,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  IndianRupee,
  Settings2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardActivity } from '@app-types/dashboard/dashboard';
import { cn } from '@utils/cn';
import { formatRelativeTime } from '@utils/format';

interface ActivityFeedProps {
  items: DashboardActivity[];
  className?: string;
}

const categoryIcons: Record<DashboardActivity['category'], LucideIcon> = {
  student: Users,
  staff: Briefcase,
  fee: IndianRupee,
  attendance: CalendarCheck,
  exam: ClipboardList,
  settings: Settings2,
};

const categoryColors: Record<DashboardActivity['category'], string> = {
  student: 'bg-blue-50 text-blue-600',
  staff: 'bg-violet-50 text-violet-600',
  fee: 'bg-emerald-50 text-emerald-600',
  attendance: 'bg-cyan-50 text-cyan-600',
  exam: 'bg-amber-50 text-amber-600',
  settings: 'bg-slate-100 text-slate-600',
};

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <ul className={cn('divide-y divide-border/70', className)}>
      {items.map((item) => {
        const Icon = categoryIcons[item.category];

        return (
          <li key={item.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                categoryColors[item.category],
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
              <time
                className="mt-1 block text-xs text-muted-foreground/80"
                dateTime={item.timestamp}
              >
                {formatRelativeTime(item.timestamp)}
              </time>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ActivityFeedEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <BookOpen className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
      <p className="mt-3 text-sm text-muted-foreground">No recent activity yet.</p>
    </div>
  );
}
