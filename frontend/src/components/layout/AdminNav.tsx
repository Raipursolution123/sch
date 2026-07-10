import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { NAV_SECTION_LABELS, ROUTES } from '@constants/index';
import type { NavItem, NavSection } from '@app-types/navigation';
import { useFilteredNav } from '@hooks/useFilteredNav';
import { useSidebar } from '@components/layout/SidebarContext';
import { cn } from '@utils/cn';

function NavLinkItem({
  item,
  depth = 0,
  collapsed = false,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const Icon = item.icon;

  if (item.disabled || !item.path) {
    return (
      <span
        className={cn(
          'flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground/60',
          depth > 0 && !collapsed && 'pl-9',
          collapsed && 'justify-center px-2',
        )}
        aria-disabled="true"
        title={collapsed ? item.label : undefined}
      >
        {Icon && depth === 0 && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        {!collapsed && (
          <>
            {item.label}
            <span className="ml-auto text-xs">Soon</span>
          </>
        )}
      </span>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-fast',
          depth > 0 && !collapsed && 'pl-9',
          collapsed && 'justify-center px-2',
          isActive || location.pathname.startsWith(item.path!)
            ? 'bg-primary-pale font-semibold text-ink'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/70',
        )
      }
      end={item.path === ROUTES.dashboard}
    >
      {Icon && depth === 0 && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

function NavGroup({
  item,
  collapsed = false,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const { expand } = useSidebar();
  const hasChildren = Boolean(item.children?.length);
  const isGroupActive = item.path ? location.pathname.startsWith(item.path) : false;
  const [open, setOpen] = useState(isGroupActive);
  const Icon = item.icon;

  if (!hasChildren) {
    return <NavLinkItem item={item} collapsed={collapsed} onNavigate={onNavigate} />;
  }

  if (collapsed) {
    return (
      <button
        type="button"
        title={item.label}
        onClick={() => {
          expand();
          setOpen(true);
        }}
        className={cn(
          'flex w-full items-center justify-center rounded-lg px-2 py-2 transition-colors duration-fast',
          isGroupActive
            ? 'bg-primary-pale text-ink'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/70',
        )}
        aria-label={`${item.label} — expand sidebar to view submenu`}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-fast',
          isGroupActive
            ? 'bg-primary-pale font-semibold text-ink'
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
            <NavLinkItem
              key={child.id}
              item={child}
              depth={1}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavSectionLabel({
  section,
  collapsed,
}: {
  section: Exclude<NavSection, 'main'>;
  collapsed: boolean;
}) {
  if (collapsed) {
    return <div className="my-3 border-t border-sidebar-border" aria-hidden="true" />;
  }

  return (
    <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0">
      {NAV_SECTION_LABELS[section]}
    </p>
  );
}

interface AdminNavProps {
  onNavigate?: () => void;
  className?: string;
  collapsed?: boolean;
}

/** Shared navigation tree used by desktop sidebar and mobile drawer. */
export function AdminNav({ onNavigate, className, collapsed = false }: AdminNavProps) {
  const navItems = useFilteredNav();
  let lastSection: NavSection | undefined;

  return (
    <nav className={cn('space-y-0.5', className)} aria-label="Main navigation">
      {navItems.map((item) => {
        const section = item.section ?? 'main';
        const needsLabel = section !== 'main' && section !== lastSection;
        if (needsLabel) lastSection = section;

        return (
          <div key={item.id}>
            {needsLabel && (
              <NavSectionLabel
                section={section as Exclude<NavSection, 'main'>}
                collapsed={collapsed}
              />
            )}
            <NavGroup item={item} collapsed={collapsed} onNavigate={onNavigate} />
          </div>
        );
      })}
    </nav>
  );
}
