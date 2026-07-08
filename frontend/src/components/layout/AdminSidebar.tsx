import { AdminNav } from '@components/layout/AdminNav';
import { env } from '@constants/env';

export function AdminSidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <p className="mt-1 truncate text-base font-semibold text-foreground">{env.appName}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <AdminNav />
      </div>
    </aside>
  );
}
