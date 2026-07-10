import type { ReactNode } from 'react';
import { PageHeader } from '@components/layout/PageHeader';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';

export interface SettingsTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface ModuleSettingsPackProps {
  title: string;
  description?: string;
  headerActions?: ReactNode;
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  footer?: ReactNode;
}

/** Settings module shell: page header + tabbed configuration panels. */
export function ModuleSettingsPack({
  title,
  description,
  headerActions,
  tabs,
  activeTab,
  onTabChange,
  isLoading,
  loadingMessage = 'Loading settings…',
  isError,
  error,
  onRetry,
  footer,
}: ModuleSettingsPackProps) {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load settings'}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} actions={headerActions} />

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

      {footer}
    </div>
  );
}
