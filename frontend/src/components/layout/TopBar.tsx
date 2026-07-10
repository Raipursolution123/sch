import { Link, useLocation } from 'react-router-dom';
import { SessionChip } from '@components/layout/SessionChip';
import { MobileNavDrawer } from '@components/layout/MobileNavDrawer';
import { UserMenu } from '@components/layout/UserMenu';
import { Breadcrumbs } from '@components/layout/Breadcrumbs';
import { ModuleSwitcher } from '@components/layout/ModuleSwitcher';
import { NotificationsBell } from '@components/layout/NotificationsBell';
import { ROUTES } from '@constants/index';
import { env } from '@constants/env';

export function TopBar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 shadow-sm lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileNavDrawer />
          <Link to={ROUTES.dashboard} className="truncate text-base font-semibold text-ink">
            {env.appName}
          </Link>
        </div>
        <div className="hidden min-w-0 md:block">
          <Breadcrumbs pathname={pathname} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ModuleSwitcher />
        <div className="hidden sm:block">
          <SessionChip />
        </div>
        <NotificationsBell />
        <UserMenu />
      </div>
    </header>
  );
}
