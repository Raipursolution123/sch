import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField } from '@components/forms/fields';
import type { Currency } from '@app-types/settings/currency';
import {
  currencyFormSchema,
  type CurrencyFormValues,
} from '@features/settings/currency/schemas/currency.schema';

interface CurrencyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: Currency | null;
  onSubmit: (values: CurrencyFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: CurrencyFormValues = {
  name: '',
  short_name: '',
  symbol: '',
  base_price: '1',
  is_active: false,
};

function toFormValues(currency: Currency): CurrencyFormValues {
  return {
    name: currency.name,
    short_name: currency.short_name,
    symbol: currency.symbol,
    base_price: currency.base_price,
    is_active: currency.is_active,
  };
}

export function CurrencyFormDialog({
  open,
  onOpenChange,
  currency,
  onSubmit,
  isLoading,
}: CurrencyFormDialogProps) {
  const isEdit = Boolean(currency);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(currency ? toFormValues(currency) : defaultValues);
    }
  }, [open, currency, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit Currency' : 'Add Currency'}
      description={
        isEdit
          ? 'Update currency details. Only one currency can be active as the school default.'
          : 'Add a currency for fees, payroll, and financial reporting.'
      }
      submitLabel={isEdit ? 'Save changes' : 'Create currency'}
      onSubmit={handleSubmit(onSubmit)}
      size="sm"
    >
      <FormErrorSummary errors={errors} />
      <FormTextField
        control={control}
        name="name"
        label="Name"
        placeholder="Indian Rupee"
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField
          control={control}
          name="short_name"
          label="Short name"
          placeholder="INR"
          hint="ISO 4217 code"
          required
        />
        <FormTextField control={control} name="symbol" label="Symbol" placeholder="₹" required />
      </div>
      <FormTextField
        control={control}
        name="base_price"
        label="Base price"
        placeholder="1"
        hint="Exchange rate relative to the base currency (default 1)."
        required
      />
      <FormSwitchField
        control={control}
        name="is_active"
        label="Set as active"
        hint="The active currency is used as the school default. Activating this will deactivate others."
      />
    </EntityFormDialog>
  );
}
