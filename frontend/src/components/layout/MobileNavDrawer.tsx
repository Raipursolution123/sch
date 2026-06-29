import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@components/ui/button';
import { AdminNav } from '@components/layout/AdminNav';
import { env } from '@constants/env';

export function MobileNavDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar shadow-lg">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Admin
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{env.appName}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <AdminNav onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
