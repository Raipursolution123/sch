import { Link, useLocation } from 'react-router-dom';
import { MobileNavDrawer } from '@components/layout/MobileNavDrawer';
import { UserMenu } from '@components/layout/UserMenu';
import { Breadcrumbs } from '@components/layout/Breadcrumbs';
import { ModuleSwitcher } from '@components/layout/ModuleSwitcher';
import { NotificationsBell } from '@components/layout/NotificationsBell';
import { useSchoolBrand } from '@hooks/usePublicBranding';
import { useActiveSession } from '@hooks/useSessions';
import { useAuthStore } from '@store/index';
import { ROUTES } from '@constants/index';
import { getBreadcrumbs } from '@utils/breadcrumbs';
import { cn } from '@utils/cn';

function formatRoleLabel(role: string | undefined): string {
  if (!role?.trim()) return 'Admin';
  return role
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function ContextChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-[10rem] items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-foreground',
        className,
      )}
      title={`${label}: ${value}`}
    >
      <span className="text-label shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate tabular-nums">{value}</span>
    </span>
  );
}

export function TopBar() {
  const { pathname } = useLocation();
  const crumbs = getBreadcrumbs(pathname);
  const { name } = useSchoolBrand();
  const user = useAuthStore((s) => s.user);
  const { data: activeSession, isLoading: sessionLoading } = useActiveSession();
  const currentPage = crumbs[crumbs.length - 1]?.label ?? name;
  const roleLabel = formatRoleLabel(user?.role);
  const sessionLabel = sessionLoading ? '…' : (activeSession?.session ?? '—');

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 sm:px-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <MobileNavDrawer />
          <div className="min-w-0">
            <Link
              to={ROUTES.dashboard}
              className="block truncate font-display text-sm font-medium tracking-display text-foreground"
            >
              {name}
            </Link>
            {pathname !== ROUTES.dashboard && (
              <p className="truncate text-xs text-muted-foreground">{currentPage}</p>
            )}
          </div>
        </div>
        <div className="hidden min-w-0 lg:block">
          <Breadcrumbs pathname={pathname} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-1.5 md:flex" aria-label="Working context">
          <ContextChip label="Role" value={roleLabel} />
          <ContextChip label="Session" value={sessionLabel} className="font-mono" />
        </div>
        <ModuleSwitcher />
        <NotificationsBell />
        <UserMenu />
      </div>
    </header>
  );
}
