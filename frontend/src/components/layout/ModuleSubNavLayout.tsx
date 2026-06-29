import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@utils/cn';

export interface ModuleNavItem {
  label: string;
  path?: string;
  disabled?: boolean;
}

interface ModuleSubNavLayoutProps {
  title: string;
  nav: ModuleNavItem[];
  'aria-label'?: string;
}

/** Reusable side sub-navigation for module areas (Settings, Academics, etc.). */
export function ModuleSubNavLayout({ title, nav, 'aria-label': ariaLabel }: ModuleSubNavLayoutProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <nav className="w-full shrink-0 lg:w-52" aria-label={ariaLabel ?? `${title} navigation`}>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <ul className="space-y-0.5">
          {nav.map((item) => (
            <li key={item.label}>
              {item.disabled || !item.path ? (
                <span className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/60">
                  {item.label}
                  <span className="text-xs">Soon</span>
                </span>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
