import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@utils/cn';

export interface ModuleNavItem {
  label: string;
  path?: string;
  disabled?: boolean;
  end?: boolean;
}

export interface ModuleNavGroup {
  label: string;
  items: ModuleNavItem[];
}

interface ModuleSubNavLayoutProps {
  title: string;
  /** Flat list (Fees, Attendance, …) or grouped sections (Settings). */
  nav: ModuleNavItem[] | ModuleNavGroup[];
  'aria-label'?: string;
}

function isGroupedNav(nav: ModuleNavItem[] | ModuleNavGroup[]): nav is ModuleNavGroup[] {
  return nav.length > 0 && 'items' in nav[0];
}

function NavItemLink({ item }: { item: ModuleNavItem }) {
  if (!item.path || item.disabled) return null;
  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'relative block whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium transition-colors duration-fast',
          isActive
            ? 'bg-primary-pale text-ink lg:before:absolute lg:before:inset-y-1.5 lg:before:left-0 lg:before:w-0.5 lg:before:rounded-full lg:before:bg-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      {item.label}
    </NavLink>
  );
}

/** Side (desktop) / horizontal (mobile) sub-navigation for module areas. */
export function ModuleSubNavLayout({
  title,
  nav,
  'aria-label': ariaLabel,
}: ModuleSubNavLayoutProps) {
  const grouped = isGroupedNav(nav);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <nav className="w-full shrink-0 lg:w-52" aria-label={ariaLabel ?? `${title} navigation`}>
        <p className="text-label mb-2 px-1 text-muted-foreground">{title}</p>

        {grouped ? (
          <div className="flex gap-4 overflow-x-auto pb-1 lg:flex-col lg:gap-4 lg:overflow-visible lg:pb-0">
            {nav.map((group) => {
              const items = group.items.filter((item) => item.path && !item.disabled);
              if (items.length === 0) return null;
              return (
                <div key={group.label} className="shrink-0 lg:w-full">
                  <p className="mb-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground/80">
                    {group.label}
                  </p>
                  <ul className="flex gap-1 lg:flex-col">
                    {items.map((item) => (
                      <li key={item.path} className="shrink-0 lg:w-full">
                        <NavItemLink item={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {nav
              .filter((item) => item.path && !item.disabled)
              .map((item) => (
                <li key={item.path} className="shrink-0 lg:w-full">
                  <NavItemLink item={item} />
                </li>
              ))}
          </ul>
        )}
      </nav>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
