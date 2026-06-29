import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import { FormField } from '@components/forms/FormField';
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
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const isActive = watch('is_active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Currency' : 'Add Currency'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update currency details. Only one currency can be active as the school default.'
                : 'Add a currency for fees, payroll, and financial reporting.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input
                id="name"
                placeholder="Indian Rupee"
                {...register('name')}
                aria-invalid={Boolean(errors.name)}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Short name"
                htmlFor="short_name"
                error={errors.short_name?.message}
                hint="ISO 4217 code"
                required
              >
                <Input
                  id="short_name"
                  placeholder="INR"
                  {...register('short_name')}
                  aria-invalid={Boolean(errors.short_name)}
                />
              </FormField>
              <FormField label="Symbol" htmlFor="symbol" error={errors.symbol?.message} required>
                <Input
                  id="symbol"
                  placeholder="₹"
                  {...register('symbol')}
                  aria-invalid={Boolean(errors.symbol)}
                />
              </FormField>
            </div>

            <FormField
              label="Base price"
              htmlFor="base_price"
              error={errors.base_price?.message}
              hint="Exchange rate relative to the base currency (default 1)."
              required
            >
              <Input
                id="base_price"
                placeholder="1"
                inputMode="decimal"
                {...register('base_price')}
                aria-invalid={Boolean(errors.base_price)}
              />
            </FormField>

            <FormField
              label="Set as active"
              hint="The active currency is used as the school default. Activating this will deactivate others."
            >
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })}
                />
                <span className="text-sm text-muted-foreground">{isActive ? 'Yes' : 'No'}</span>
              </div>
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? 'Save changes' : 'Create currency'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
