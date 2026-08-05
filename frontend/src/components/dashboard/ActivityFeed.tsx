import type { DashboardActivity } from '@app-types/dashboard/dashboard';
import { cn } from '@utils/cn';
import { formatRelativeTime } from '@utils/format';

interface ActivityFeedProps {
  items: DashboardActivity[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <ul className={cn('hm-activity', className)}>
      {items.map((item) => (
        <li key={item.id}>
          <span className="hm-activity__cat">{item.category}</span>
          <div className="min-w-0">
            <p className="hm-activity__title">{item.title}</p>
            <p className="hm-activity__desc">{item.description}</p>
            <time className="hm-activity__time" dateTime={item.timestamp}>
              {formatRelativeTime(item.timestamp)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ActivityFeedEmpty() {
  return (
    <div className="hm-empty hm-empty--rich" role="status">
      <p className="hm-empty__title">Quiet so far</p>
      <p className="hm-empty__desc">Admissions, fees, and attendance updates will land here.</p>
    </div>
  );
}
