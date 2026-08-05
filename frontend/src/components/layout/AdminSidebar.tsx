import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { BrandMark } from '@components/brand/BrandMark';
import { AdminNav } from '@components/layout/AdminNav';
import { useSidebar } from '@components/layout/SidebarContext';
import { Button } from '@components/ui/button';
import { useSchoolBrand } from '@hooks/usePublicBranding';
import { ROUTES } from '@constants/index';
import { cn } from '@utils/cn';

/** Instrument Rail — Concept A shell chrome. */
export function AdminSidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const { name } = useSchoolBrand();

  return (
    <aside
      data-collapsed={collapsed ? 'true' : 'false'}
      className={cn(
        'sticky top-0 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-fast ease-out',
        collapsed ? 'w-[4.5rem] min-w-[4.5rem] max-w-[4.5rem]' : 'w-[15.5rem] min-w-[15.5rem]',
      )}
      aria-label="Application sidebar"
      aria-expanded={!collapsed}
    >
      <div
        className={cn(
          'shrink-0 border-b border-sidebar-border',
          collapsed ? 'px-2 py-4' : 'px-4 py-4',
        )}
      >
        {collapsed ? (
          <div className="mx-auto flex justify-center">
            <BrandMark variant="compact" to={ROUTES.dashboard} preferSmall />
          </div>
        ) : (
          <BrandMark to={ROUTES.dashboard} eyebrow="Admin" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        <AdminNav collapsed={collapsed} />
      </div>

      <div className="shrink-0 border-t border-sidebar-border p-2">
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className={cn(
            'w-full text-muted-foreground hover:text-foreground',
            !collapsed && 'justify-start gap-2',
          )}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleCollapsed();
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? `Expand — ${name}` : 'Collapse sidebar'}
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
