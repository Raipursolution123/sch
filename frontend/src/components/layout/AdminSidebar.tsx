import { Link } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { AdminNav } from '@components/layout/AdminNav';
import { useSidebar } from '@components/layout/SidebarContext';
import { Button } from '@components/ui/button';
import { env } from '@constants/env';
import { ROUTES } from '@constants/index';
import { cn } from '@utils/cn';

export function AdminSidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      data-collapsed={collapsed ? 'true' : 'false'}
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-fast ease-out',
        collapsed ? 'w-[4.5rem] min-w-[4.5rem] max-w-[4.5rem]' : 'w-64 min-w-[16rem]',
      )}
      aria-label="Application sidebar"
      aria-expanded={!collapsed}
    >
      <div className={cn('border-b border-sidebar-border', collapsed ? 'px-2 py-4' : 'px-5 py-5')}>
        {collapsed ? (
          <Link
            to={ROUTES.dashboard}
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary-pale text-sm font-bold text-ink"
            title={env.appName}
            aria-label={env.appName}
          >
            {env.appName.charAt(0)}
          </Link>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            <p className="mt-1 truncate text-base font-semibold text-foreground">{env.appName}</p>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
        <AdminNav collapsed={collapsed} />
      </div>

      <div className="shrink-0 border-t border-sidebar-border p-2">
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className={cn('w-full', !collapsed && 'justify-start gap-2')}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleCollapsed();
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
