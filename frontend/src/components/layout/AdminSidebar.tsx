import { AdminNav } from '@components/layout/AdminNav';
import { env } from '@constants/env';

export function AdminSidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin</p>
        <p className="truncate text-sm font-semibold text-foreground">{env.appName}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <AdminNav />
      </div>
    </aside>
  );
}
