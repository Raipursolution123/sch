import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import { FormField } from '@components/forms/FormField';
import { SettingsCard } from '@components/forms/SettingsCard';
import {
  maintenanceSchema,
  type MaintenanceFormValues,
} from '@features/settings/general/schemas/general-settings.schema';
import type { GeneralSettings, MaintenancePayload } from '@app-types/settings/general';

interface MaintenanceTabProps {
  settings: GeneralSettings;
  onSave: (payload: MaintenancePayload) => void;
  isSaving: boolean;
}

export function MaintenanceTab({ settings, onSave, isSaving }: MaintenanceTabProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      maintenance_mode: settings.maintenance_mode,
      lock_grace_period: settings.lock_grace_period,
      student_panel_login: settings.student_panel_login,
      parent_panel_login: settings.parent_panel_login,
    },
  });

  useEffect(() => {
    reset({
      maintenance_mode: settings.maintenance_mode,
      lock_grace_period: settings.lock_grace_period,
      student_panel_login: settings.student_panel_login,
      parent_panel_login: settings.parent_panel_login,
    });
  }, [settings, reset]);

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <SettingsCard
        title="Maintenance & Access"
        description="Control system availability and student/parent portal access."
        footer={
          <Button type="submit" isLoading={isSaving} disabled={!isDirty && !isSaving}>
            Save changes
          </Button>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Maintenance mode"
            hint="When enabled, non-admin users cannot access the system."
          >
            <Controller
              name="maintenance_mode"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    id="maintenance_mode"
                    checked={field.value === 1}
                    onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                    aria-label="Enable maintenance mode"
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.value === 1 ? 'System in maintenance' : 'System operational'}
                  </span>
                </div>
              )}
            />
          </FormField>
          <FormField
            label="Lock grace period (days)"
            htmlFor="lock_grace_period"
            error={errors.lock_grace_period?.message}
            hint="Days before locked features become unavailable after expiry."
          >
            <Input id="lock_grace_period" type="number" min={0} {...register('lock_grace_period', { valueAsNumber: true })} />
          </FormField>
          <FormField label="Student panel login">
            <Controller
              name="student_panel_login"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    id="student_panel_login"
                    checked={field.value === 1}
                    onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                    aria-label="Allow student panel login"
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.value === 1 ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
            />
          </FormField>
          <FormField label="Parent panel login">
            <Controller
              name="parent_panel_login"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    id="parent_panel_login"
                    checked={field.value === 1}
                    onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                    aria-label="Allow parent panel login"
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.value === 1 ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
            />
          </FormField>
        </div>
      </SettingsCard>
    </form>
  );
}
