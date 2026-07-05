import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { FormField } from '@components/forms/FormField';
import { SettingsCard } from '@components/forms/SettingsCard';
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
    register,
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
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <SettingsCard
        title="Fees Settings"
        description="Currency display and fee collection rules."
        footer={
          <Button type="submit" isLoading={isSaving} disabled={!isDirty && !isSaving}>
            Save changes
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Currency code"
            htmlFor="currency"
            error={errors.currency?.message}
            required
          >
            <Input id="currency" placeholder="INR" {...register('currency')} />
          </FormField>
          <FormField
            label="Currency symbol"
            htmlFor="currency_symbol"
            error={errors.currency_symbol?.message}
            required
          >
            <Input id="currency_symbol" placeholder="₹" {...register('currency_symbol')} />
          </FormField>
          <FormField label="Symbol placement" error={errors.currency_place?.message} required>
            <Select
              options={[...CURRENCY_PLACE_OPTIONS]}
              error={errors.currency_place?.message}
              {...register('currency_place')}
            />
          </FormField>
          <FormField
            label="Fee due reminder (days)"
            htmlFor="fee_due_days"
            error={errors.fee_due_days?.message}
          >
            <Input
              id="fee_due_days"
              type="number"
              min={0}
              {...register('fee_due_days', { valueAsNumber: true })}
            />
          </FormField>
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
  );
}
