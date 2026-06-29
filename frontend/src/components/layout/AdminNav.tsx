import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { ADMIN_NAV, ROUTES, type NavItem } from '@constants/index';
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

  if (item.disabled || !item.path) {
    return (
      <span
        className={cn(
          'flex cursor-not-allowed items-center rounded-md px-3 py-2 text-sm text-muted-foreground/60',
          depth > 0 && 'pl-8',
        )}
        aria-disabled="true"
      >
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
          'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          depth > 0 && 'pl-8',
          isActive || location.pathname.startsWith(item.path!)
            ? 'bg-sidebar-accent text-primary'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/70',
        )
      }
      end={item.path === ROUTES.dashboard}
    >
      {item.label}
    </NavLink>
  );
}

function NavGroup({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const location = useLocation();
  const hasChildren = Boolean(item.children?.length);
  const isGroupActive = item.path ? location.pathname.startsWith(item.path) : false;
  const [open, setOpen] = useState(isGroupActive);

  if (!hasChildren) {
    return <NavLinkItem item={item} onNavigate={onNavigate} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isGroupActive
            ? 'bg-sidebar-accent text-primary'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/70',
        )}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        {item.label}
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

interface AdminNavProps {
  onNavigate?: () => void;
  className?: string;
}

/** Shared navigation tree used by desktop sidebar and mobile drawer. */
export function AdminNav({ onNavigate, className }: AdminNavProps) {
  return (
    <nav className={cn('space-y-1', className)} aria-label="Main navigation">
      {ADMIN_NAV.map((item) => (
        <NavGroup key={item.label} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
