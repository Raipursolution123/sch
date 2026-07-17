import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { getApiErrorMessage } from '@utils/error-message';

export interface ProfileTab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface ModuleProfilePackProps {
  backTo: string;
  backLabel?: string;
  headerActions?: ReactNode;
  tabs: ProfileTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  errorTitle?: string;
  error?: unknown;
  onRetry?: () => void;
  footer?: ReactNode;
}

/** Entity profile shell: back nav + tabbed sections + action slot. */
export function ModuleProfilePack({
  backTo,
  backLabel = 'Back',
  headerActions,
  tabs,
  activeTab,
  onTabChange,
  isLoading,
  loadingMessage = 'Loading profile…',
  isError,
  errorTitle = 'Not found',
  error,
  onRetry,
  footer,
}: ModuleProfilePackProps) {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (isError) {
    return (
      <ErrorState
        title={errorTitle}
        message={getApiErrorMessage(error, 'Could not load profile')}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
        {headerActions}
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled}>
              {tab.label}
              {tab.disabled && <span className="sr-only"> (coming soon)</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

      {footer}
    </div>
  );
}
