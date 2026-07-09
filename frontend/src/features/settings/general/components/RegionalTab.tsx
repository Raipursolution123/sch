import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField } from '@components/forms/fields';
import { FormField } from '@components/forms/FormField';
import { SettingsCard } from '@components/forms/SettingsCard';
import { Switch } from '@components/ui/switch';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useUnsavedChangesWarning } from '@hooks/useUnsavedChangesWarning';
import {
  DATE_FORMAT_OPTIONS,
  MONTH_OPTIONS,
  TIME_FORMAT_OPTIONS,
  TIMEZONE_OPTIONS,
  WEEKDAY_OPTIONS,
} from '@features/settings/general/constants/options';
import {
  regionalSchema,
  type RegionalFormValues,
} from '@features/settings/general/schemas/general-settings.schema';
import type { GeneralSettings, RegionalPayload } from '@app-types/settings/general';

interface RegionalTabProps {
  settings: GeneralSettings;
  onSave: (payload: RegionalPayload) => void;
  isSaving: boolean;
}

export function RegionalTab({ settings, onSave, isSaving }: RegionalTabProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RegionalFormValues>({
    resolver: zodResolver(regionalSchema),
    defaultValues: {
      timezone: settings.timezone,
      date_format: settings.date_format,
      time_format: settings.time_format,
      start_month: settings.start_month,
      start_week: settings.start_week,
      day_off: settings.day_off,
      is_rtl: settings.is_rtl,
    },
  });

  const { navigationGuard } = useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    reset({
      timezone: settings.timezone,
      date_format: settings.date_format,
      time_format: settings.time_format,
      start_month: settings.start_month,
      start_week: settings.start_week,
      day_off: settings.day_off,
      is_rtl: settings.is_rtl,
    });
  }, [settings, reset]);

  return (
    <>
      {navigationGuard}
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <SettingsCard
          title="Regional Settings"
          description="Date, time, timezone, and calendar preferences for the school."
          footer={
            <PermissionButton
              type="submit"
              permission="settings.manage"
              isLoading={isSaving}
              disabled={!isDirty && !isSaving}
            >
              Save changes
            </PermissionButton>
          }
        >
          <FormErrorSummary errors={errors} className="mb-2" />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelectField
              control={control}
              name="timezone"
              label="Timezone"
              options={[...TIMEZONE_OPTIONS]}
              required
            />
            <FormSelectField
              control={control}
              name="date_format"
              label="Date format"
              options={[...DATE_FORMAT_OPTIONS]}
              required
            />
            <FormSelectField
              control={control}
              name="time_format"
              label="Time format"
              options={[...TIME_FORMAT_OPTIONS]}
              required
            />
            <FormSelectField
              control={control}
              name="start_month"
              label="Academic year starts in"
              options={[...MONTH_OPTIONS]}
              required
            />
            <FormSelectField
              control={control}
              name="start_week"
              label="Week starts on"
              options={[...WEEKDAY_OPTIONS]}
              required
            />
            <FormSelectField
              control={control}
              name="day_off"
              label="Weekly day off"
              options={[{ value: '', label: 'None' }, ...WEEKDAY_OPTIONS]}
              optional
            />
          </div>

          <FormField
            label="Right-to-left (RTL) layout"
            hint="Enable for Arabic, Hebrew, and other RTL languages."
          >
            <Controller
              name="is_rtl"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_rtl"
                    checked={field.value === 'enabled'}
                    onCheckedChange={(checked) => field.onChange(checked ? 'enabled' : 'disabled')}
                    aria-label="Enable right-to-left layout"
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.value === 'enabled' ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
            />
          </FormField>
        </SettingsCard>
      </form>
    </>
  );
}
