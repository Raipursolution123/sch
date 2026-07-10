import type { ReactNode } from 'react';
import { AdminSidebar } from '@components/layout/AdminSidebar';
import { SidebarProvider } from '@components/layout/SidebarContext';
import { TopBar } from '@components/layout/TopBar';
import { cn } from '@utils/cn';

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

/** Enterprise app chrome: collapsible sidebar, top bar, skip link, content region. */
export function AppShell({ children, className }: AppShellProps) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <div className={cn('flex min-h-screen bg-background', className)}>
        <div className="hidden shrink-0 md:block" data-app-chrome>
          <AdminSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-auto bg-canvas-soft p-4 outline-none lg:p-8"
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
