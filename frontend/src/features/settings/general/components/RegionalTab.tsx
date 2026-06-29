import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { Select } from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { FormField } from '@components/forms/FormField';
import { SettingsCard } from '@components/forms/SettingsCard';
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
    register,
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
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <SettingsCard
        title="Regional Settings"
        description="Date, time, timezone, and calendar preferences for the school."
        footer={
          <Button type="submit" isLoading={isSaving} disabled={!isDirty && !isSaving}>
            Save changes
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Timezone" error={errors.timezone?.message} required>
            <Select
              options={[...TIMEZONE_OPTIONS]}
              error={errors.timezone?.message}
              {...register('timezone')}
            />
          </FormField>
          <FormField label="Date format" error={errors.date_format?.message} required>
            <Select
              options={[...DATE_FORMAT_OPTIONS]}
              error={errors.date_format?.message}
              {...register('date_format')}
            />
          </FormField>
          <FormField label="Time format" error={errors.time_format?.message} required>
            <Select
              options={[...TIME_FORMAT_OPTIONS]}
              error={errors.time_format?.message}
              {...register('time_format')}
            />
          </FormField>
          <FormField label="Academic year starts in" error={errors.start_month?.message} required>
            <Select
              options={[...MONTH_OPTIONS]}
              error={errors.start_month?.message}
              {...register('start_month')}
            />
          </FormField>
          <FormField label="Week starts on" error={errors.start_week?.message} required>
            <Select
              options={[...WEEKDAY_OPTIONS]}
              error={errors.start_week?.message}
              {...register('start_week')}
            />
          </FormField>
          <FormField label="Weekly day off" error={errors.day_off?.message}>
            <Select
              options={[{ value: '', label: 'None' }, ...WEEKDAY_OPTIONS]}
              error={errors.day_off?.message}
              {...register('day_off')}
            />
          </FormField>
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
  );
}
