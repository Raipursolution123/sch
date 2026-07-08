import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@utils/cn';
import type { SoftTone } from '@utils/tone';
import { toneIconClasses } from '@utils/tone';

export interface QuickActionItem {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  tone?: SoftTone;
}

interface QuickActionTileProps {
  item: QuickActionItem;
  className?: string;
}

const toneClasses = {
  primary: toneIconClasses('primary', true),
  success: toneIconClasses('success', true),
  warning: toneIconClasses('warning', true),
  danger: toneIconClasses('danger', true),
  neutral: toneIconClasses('neutral', true),
  violet: toneIconClasses('violet', true),
  teal: toneIconClasses('teal', true),
  brown: toneIconClasses('brown', true),
} as const satisfies Record<SoftTone, string>;

export function QuickActionTile({ item, className }: QuickActionTileProps) {
  const Icon = item.icon;
  const tone = item.tone ?? 'primary';

  return (
    <Link
      to={item.path}
      className={cn(
        'group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
          toneClasses[tone],
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{item.label}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
      </div>
      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}
