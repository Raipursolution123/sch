import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@utils/cn';
import type { SoftTone } from '@utils/tone';

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

/** Typographic index link — Cobalt refuses icon-tile grids. */
export function QuickActionTile({ item, className }: QuickActionTileProps) {
  return (
    <Link to={item.path} className={cn('hm-action', className)}>
      <span className="hm-action__label">{item.label}</span>
      <p className="hm-action__desc">{item.description}</p>
    </Link>
  );
}
