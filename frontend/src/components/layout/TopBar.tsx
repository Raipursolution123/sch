import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@components/ui/button';
import { SessionChip } from '@components/layout/SessionChip';
import { MobileNavDrawer } from '@components/layout/MobileNavDrawer';
import { ROUTES } from '@constants/index';
import { env } from '@constants/env';
import { useAuthStore } from '@store/index';

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

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
        <SessionChip />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user?.username || user?.role}
        </span>
        <Button variant="ghost" size="sm" onClick={() => clearAuth()}>
          <LogOut className="h-4 w-4 sm:mr-1" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
