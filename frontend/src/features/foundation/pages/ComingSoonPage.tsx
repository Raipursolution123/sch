import { Construction } from 'lucide-react';
import { useMatches } from 'react-router-dom';
import { Badge } from '@components/ui/badge';
import { PageContainer } from '@components/layout/PageContainer';
import { PageHeader } from '@components/layout/PageHeader';
import type { AppRouteHandle } from '@app-types/navigation';

function resolvePageMeta(matches: ReturnType<typeof useMatches>): AppRouteHandle['page'] {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index].handle as AppRouteHandle | undefined;
    if (handle?.page) return handle.page;
  }

  return {
    title: 'Coming Soon',
    description:
      'This module is part of the admin foundation and will be implemented in a future release.',
  };
}

/** Placeholder page for routes registered in the navigation map but not yet implemented. */
export function ComingSoonPage() {
  const matches = useMatches();
  const meta = resolvePageMeta(matches);

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        actions={<Badge variant="secondary">Coming Soon</Badge>}
      />

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-pale text-ink">
          <Construction className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Module not yet implemented</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The navigation and routing foundation is in place. Business logic for{' '}
          <span className="font-medium text-foreground">{meta.title}</span> will be delivered in a
          vertical slice without changing legacy business rules.
        </p>
        {meta.module && (
          <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
            Module group: {meta.module}
          </p>
        )}
      </div>
    </PageContainer>
  );
}
