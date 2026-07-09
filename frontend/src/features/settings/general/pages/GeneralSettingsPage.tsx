import { useSearchParams } from 'react-router-dom';
import { GENERAL_SETTINGS_TABS } from '@features/settings/general/constants/options';
import { SchoolProfileTab } from '@features/settings/general/components/SchoolProfileTab';
import { RegionalTab } from '@features/settings/general/components/RegionalTab';
import { AttendanceTab } from '@features/settings/general/components/AttendanceTab';
import { FeesTab } from '@features/settings/general/components/FeesTab';
import { MaintenanceTab } from '@features/settings/general/components/MaintenanceTab';
import { useGeneralSettings, useUpdateGeneralSettings } from '@hooks/useGeneralSettings';
import { ModuleSettingsPack } from '@workflow-packs';
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

  const onSave = (payload: Parameters<typeof updateMutation.mutate>[0]) => {
    updateMutation.mutate(payload);
  };

  return (
    <ModuleSettingsPack
      title="General Settings"
      description="Configure school profile, regional preferences, attendance, fees, and system access."
      isLoading={isLoading}
      loadingMessage="Loading general settings..."
      isError={isError || !settings}
      error={error}
      onRetry={() => void refetch()}
      tabs={
        settings
          ? GENERAL_SETTINGS_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              content:
                tab.id === 'school-profile' ? (
                  <SchoolProfileTab
                    settings={settings}
                    onSave={onSave}
                    isSaving={updateMutation.isPending}
                  />
                ) : tab.id === 'regional' ? (
                  <RegionalTab
                    settings={settings}
                    onSave={onSave}
                    isSaving={updateMutation.isPending}
                  />
                ) : tab.id === 'attendance' ? (
                  <AttendanceTab
                    settings={settings}
                    onSave={onSave}
                    isSaving={updateMutation.isPending}
                  />
                ) : tab.id === 'fees' ? (
                  <FeesTab settings={settings} onSave={onSave} isSaving={updateMutation.isPending} />
                ) : (
                  <MaintenanceTab
                    settings={settings}
                    onSave={onSave}
                    isSaving={updateMutation.isPending}
                  />
                ),
            }))
          : []
      }
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
