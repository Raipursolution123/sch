import type { ReactNode } from 'react';
import { PageContainer } from '@components/layout/PageContainer';
import { PageHeader } from '@components/layout/PageHeader';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { getApiErrorMessage } from '@utils/error-message';

export interface SettingsTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface ModuleSettingsPackBase {
  title: string;
  description?: string;
  headerActions?: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  footer?: ReactNode;
  bare?: boolean;
}

interface ModuleSettingsPackTabs extends ModuleSettingsPackBase {
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children?: never;
}

interface ModuleSettingsPackChildren extends ModuleSettingsPackBase {
  children: ReactNode;
  tabs?: never;
  activeTab?: never;
  onTabChange?: never;
}

type ModuleSettingsPackProps = ModuleSettingsPackTabs | ModuleSettingsPackChildren;

/** Settings module shell: header + tabbed panels or single configuration body. */
export function ModuleSettingsPack(props: ModuleSettingsPackProps) {
  const {
    title,
    description,
    headerActions,
    isLoading,
    loadingMessage = 'Loading settings…',
    isError,
    error,
    onRetry,
    footer,
    bare = false,
  } = props;

  if (isLoading) {
    const loading = <LoadingState message={loadingMessage} />;
    return bare ? loading : <PageContainer size="default">{loading}</PageContainer>;
  }

  if (isError) {
    const err = (
      <ErrorState
        message={getApiErrorMessage(error, 'Could not load settings')}
        onRetry={onRetry}
      />
    );
    return bare ? err : <PageContainer size="default">{err}</PageContainer>;
  }

  const body = (
    <>
      <PageHeader title={title} description={description} actions={headerActions} />

      {'tabs' in props && props.tabs ? (
        <Tabs value={props.activeTab} onValueChange={props.onTabChange} className="w-full">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
            {props.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {props.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-4">{'children' in props ? props.children : null}</div>
      )}

      {footer}
    </>
  );

  if (bare) {
    return <div className="space-y-6">{body}</div>;
  }

  return <PageContainer size="default">{body}</PageContainer>;
}
