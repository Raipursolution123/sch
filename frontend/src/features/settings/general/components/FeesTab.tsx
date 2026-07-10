import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormSelectField, FormTextField } from '@components/forms/fields';
import { FormField } from '@components/forms/FormField';
import { SettingsCard } from '@components/forms/SettingsCard';
import { Switch } from '@components/ui/switch';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { useUnsavedChangesWarning } from '@hooks/useUnsavedChangesWarning';
import { CURRENCY_PLACE_OPTIONS } from '@features/settings/general/constants/options';
import {
  feesSettingsSchema,
  type FeesSettingsFormValues,
} from '@features/settings/general/schemas/general-settings.schema';
import type { FeesSettingsPayload, GeneralSettings } from '@app-types/settings/general';

interface FeesTabProps {
  settings: GeneralSettings;
  onSave: (payload: FeesSettingsPayload) => void;
  isSaving: boolean;
}

export function FeesTab({ settings, onSave, isSaving }: FeesTabProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FeesSettingsFormValues>({
    resolver: zodResolver(feesSettingsSchema),
    defaultValues: {
      currency: settings.currency,
      currency_symbol: settings.currency_symbol,
      currency_place: settings.currency_place,
      collect_back_date_fees: settings.collect_back_date_fees,
      fee_due_days: settings.fee_due_days,
      is_duplicate_fees_invoice: settings.is_duplicate_fees_invoice as '0' | '1',
    },
  });

  const { navigationGuard } = useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    reset({
      currency: settings.currency,
      currency_symbol: settings.currency_symbol,
      currency_place: settings.currency_place,
      collect_back_date_fees: settings.collect_back_date_fees,
      fee_due_days: settings.fee_due_days,
      is_duplicate_fees_invoice: settings.is_duplicate_fees_invoice as '0' | '1',
    });
  }, [settings, reset]);

  return (
    <>
      {navigationGuard}
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <SettingsCard
          title="Fees Settings"
          description="Currency display and fee collection rules."
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
            <FormTextField
              control={control}
              name="currency"
              label="Currency code"
              placeholder="INR"
              required
            />
            <FormTextField
              control={control}
              name="currency_symbol"
              label="Currency symbol"
              placeholder="₹"
              required
            />
            <FormSelectField
              control={control}
              name="currency_place"
              label="Symbol placement"
              options={[...CURRENCY_PLACE_OPTIONS]}
              required
            />
            <FormNumberField
              control={control}
              name="fee_due_days"
              label="Fee due reminder (days)"
              min={0}
              optional
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <FormField label="Allow back-dated fee collection">
              <Controller
                name="collect_back_date_fees"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="collect_back_date_fees"
                      checked={field.value === 1}
                      onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                      aria-label="Allow back-dated fee collection"
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value === 1 ? 'Allowed' : 'Not allowed'}
                    </span>
                  </div>
                )}
              />
            </FormField>
            <FormField label="Allow duplicate fee invoices">
              <Controller
                name="is_duplicate_fees_invoice"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_duplicate_fees_invoice"
                      checked={field.value === '1'}
                      onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                      aria-label="Allow duplicate fee invoices"
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value === '1' ? 'Allowed' : 'Not allowed'}
                    </span>
                  </div>
                )}
              />
            </FormField>
          </div>
        </SettingsCard>
      </form>
    </>
  );
}
