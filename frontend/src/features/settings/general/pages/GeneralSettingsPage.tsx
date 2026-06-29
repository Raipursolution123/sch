import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@components/layout/PageHeader';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { GENERAL_SETTINGS_TABS } from '@features/settings/general/constants/options';
import { SchoolProfileTab } from '@features/settings/general/components/SchoolProfileTab';
import { RegionalTab } from '@features/settings/general/components/RegionalTab';
import { AttendanceTab } from '@features/settings/general/components/AttendanceTab';
import { FeesTab } from '@features/settings/general/components/FeesTab';
import { MaintenanceTab } from '@features/settings/general/components/MaintenanceTab';
import { useGeneralSettings, useUpdateGeneralSettings } from '@hooks/useGeneralSettings';
import type { GeneralSettingsTab } from '@app-types/settings/general';

const DEFAULT_TAB: GeneralSettingsTab = 'school-profile';

function isValidTab(value: string | null): value is GeneralSettingsTab {
  return GENERAL_SETTINGS_TABS.some((tab) => tab.id === value);
}

export function GeneralSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = isValidTab(tabParam) ? tabParam : DEFAULT_TAB;

  const { data: settings, isLoading, isError, error, refetch } = useGeneralSettings();
  const updateMutation = useUpdateGeneralSettings();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  if (isLoading) {
    return <LoadingState message="Loading general settings..." />;
  }

  if (isError || !settings) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load general settings'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Settings"
        description="Configure school profile, regional preferences, attendance, fees, and system access."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          {GENERAL_SETTINGS_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="school-profile">
          <SchoolProfileTab
            settings={settings}
            onSave={(payload) => updateMutation.mutate(payload)}
            isSaving={updateMutation.isPending}
          />
        </TabsContent>
        <TabsContent value="regional">
          <RegionalTab
            settings={settings}
            onSave={(payload) => updateMutation.mutate(payload)}
            isSaving={updateMutation.isPending}
          />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendanceTab
            settings={settings}
            onSave={(payload) => updateMutation.mutate(payload)}
            isSaving={updateMutation.isPending}
          />
        </TabsContent>
        <TabsContent value="fees">
          <FeesTab
            settings={settings}
            onSave={(payload) => updateMutation.mutate(payload)}
            isSaving={updateMutation.isPending}
          />
        </TabsContent>
        <TabsContent value="maintenance">
          <MaintenanceTab
            settings={settings}
            onSave={(payload) => updateMutation.mutate(payload)}
            isSaving={updateMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
