import { Link } from 'react-router-dom';
import { SessionChip } from '@components/layout/SessionChip';
import { MobileNavDrawer } from '@components/layout/MobileNavDrawer';
import { UserMenu } from '@components/layout/UserMenu';
import { ROUTES } from '@constants/index';
import { env } from '@constants/env';

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <MobileNavDrawer />
        <Link to={ROUTES.dashboard} className="text-lg font-semibold text-primary">
          {env.appName}
        </Link>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <SessionChip />
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
