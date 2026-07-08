import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  ADMIN_NAV,
  NAV_SECTION_LABELS,
  ROUTES,
  type NavItem,
  type NavSection,
} from '@constants/index';
import { cn } from '@utils/cn';

function NavLinkItem({
  item,
  depth = 0,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const Icon = item.icon;

  if (item.disabled || !item.path) {
    return (
      <span
        className={cn(
          'flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground/60',
          depth > 0 && 'pl-9',
        )}
        aria-disabled="true"
      >
        {Icon && depth === 0 && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        {item.label}
        <span className="ml-auto text-xs">Soon</span>
      </span>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          depth > 0 && 'pl-9',
          isActive || location.pathname.startsWith(item.path!)
            ? 'bg-primary/10 text-primary'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/70',
        )
      }
      end={item.path === ROUTES.dashboard}
    >
      {Icon && depth === 0 && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {item.label}
    </NavLink>
  );
}

function NavGroup({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const location = useLocation();
  const hasChildren = Boolean(item.children?.length);
  const isGroupActive = item.path ? location.pathname.startsWith(item.path) : false;
  const [open, setOpen] = useState(isGroupActive);
  const Icon = item.icon;

  if (!hasChildren) {
    return <NavLinkItem item={item} onNavigate={onNavigate} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isGroupActive
            ? 'bg-primary/10 text-primary'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/70',
        )}
        aria-expanded={open}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span className="flex-1 text-left">{item.label}</span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="mt-1 space-y-0.5">
          {item.children!.map((child) => (
            <NavLinkItem key={child.label} item={child} depth={1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

function NavSectionLabel({ section }: { section: Exclude<NavSection, 'main'> }) {
  return (
    <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0">
      {NAV_SECTION_LABELS[section]}
    </p>
  );
}

interface AdminNavProps {
  onNavigate?: () => void;
  className?: string;
}

/** Shared navigation tree used by desktop sidebar and mobile drawer. */
export function AdminNav({ onNavigate, className }: AdminNavProps) {
  let lastSection: NavSection | undefined;

  return (
    <nav className={cn('space-y-0.5', className)} aria-label="Main navigation">
      {ADMIN_NAV.map((item) => {
        const section = item.section ?? 'main';
        const needsLabel = section !== 'main' && section !== lastSection;
        if (needsLabel) lastSection = section;

        return (
          <div key={item.label}>
            {needsLabel && <NavSectionLabel section={section as Exclude<NavSection, 'main'>} />}
            <NavGroup item={item} onNavigate={onNavigate} />
          </div>
        );
      })}
    </nav>
  );
}
