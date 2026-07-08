import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight, Clock, Info } from 'lucide-react';
import type { AttentionItem } from '@app-types/dashboard/dashboard';
import { cn } from '@utils/cn';

interface AttentionListProps {
  items: AttentionItem[];
  className?: string;
}

const severityConfig = {
  danger: {
    icon: AlertCircle,
    iconClass: 'text-destructive',
    bgClass: 'bg-destructive/10',
  },
  warning: {
    icon: Clock,
    iconClass: 'text-warning',
    bgClass: 'bg-warning/10',
  },
  info: {
    icon: Info,
    iconClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
} as const;

function AttentionRow({ item }: { item: AttentionItem }) {
  const config = severityConfig[item.severity];
  const Icon = config.icon;

  const content = (
    <>
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          config.bgClass,
        )}
      >
        <Icon className={cn('h-4 w-4', config.iconClass)} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>
      {item.href && (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
    </>
  );

  const rowClass =
    'flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-muted/50';

  if (item.href) {
    return (
      <Link to={item.href} className={rowClass}>
        {content}
      </Link>
    );
  }

  return <div className={rowClass}>{content}</div>;
}

export function AttentionList({ items, className }: AttentionListProps) {
  if (items.length === 0) {
    return (
      <p className={cn('py-6 text-center text-sm text-muted-foreground', className)}>
        Nothing needs attention right now.
      </p>
    );
  }

  return (
    <ul className={cn('divide-y divide-border/60', className)}>
      {items.map((item) => (
        <li key={item.id}>
          <AttentionRow item={item} />
        </li>
      ))}
    </ul>
  );
}
