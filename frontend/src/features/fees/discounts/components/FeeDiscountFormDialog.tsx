import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import {
  FormNumberField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { Select } from '@components/ui/select';
import { useActiveSession, useSessions } from '@hooks/useSessions';
import type { FeeDiscount } from '@app-types/fees/fee-discount';
import {
  feeDiscountFormSchema,
  type FeeDiscountFormValues,
} from '@features/fees/discounts/schemas/fee-discount.schema';

interface FeeDiscountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount?: FeeDiscount | null;
  onSubmit: (values: FeeDiscountFormValues) => void;
  isLoading?: boolean;
}

const TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed amount' },
];

export function FeeDiscountFormDialog({
  open,
  onOpenChange,
  discount,
  onSubmit,
  isLoading,
}: FeeDiscountFormDialogProps) {
  const isEdit = Boolean(discount);
  const { data: sessionsPage } = useSessions(1);
  const { data: activeSession } = useActiveSession();
  const sessions = sessionsPage?.results ?? [];

  const sessionOptions = useMemo(
    () =>
      sessions.map((session) => ({
        value: String(session.id),
        label: session.session,
      })),
    [sessions],
  );

  const defaultSessionId = activeSession?.id ?? sessions[0]?.id ?? 0;

  const defaultValues: FeeDiscountFormValues = {
    name: '',
    code: '',
    session_id: defaultSessionId,
    type: 'percentage',
    percentage: 10,
    amount: null,
    description: '',
    is_active: true,
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FeeDiscountFormValues>({
    resolver: zodResolver(feeDiscountFormSchema),
    defaultValues,
  });

  const discountType = useWatch({ control, name: 'type' });

  useEffect(() => {
    if (!open) return;
    if (discount) {
      reset({
        name: discount.name,
        code: discount.code,
        session_id: discount.session_id,
        type: discount.type === 'fixed' || discount.type === 'amount' ? 'fixed' : 'percentage',
        percentage: discount.percentage,
        amount: discount.amount,
        description: discount.description ?? '',
        is_active: discount.is_active === 'yes',
      });
      return;
    }
    reset({
      ...defaultValues,
      session_id: defaultSessionId,
    });
  }, [open, discount, reset, defaultSessionId]);

  useEffect(() => {
    if (discountType === 'percentage') {
      setValue('amount', null);
      return;
    }
    setValue('percentage', null);
  }, [discountType, setValue]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit fee discount' : 'Add fee discount'}
      description="Define percentage or fixed discounts for the selected session."
      submitLabel={isEdit ? 'Save changes' : 'Add fee discount'}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormErrorSummary errors={errors} />
      <FormTextField
        control={control}
        name="name"
        label="Name"
        placeholder="Sibling discount"
        required
      />
      <FormTextField control={control} name="code" label="Code" placeholder="SIB10" required />

      <FormField label="Session" htmlFor="session_id" error={errors.session_id?.message} required>
        <Controller
          name="session_id"
          control={control}
          render={({ field }) => (
            <Select
              id="session_id"
              placeholder="Select session"
              options={sessionOptions}
              value={field.value ? String(field.value) : ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
      </FormField>

      <FormField label="Type" htmlFor="type" error={errors.type?.message} required>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              id="type"
              placeholder="Select type"
              options={TYPE_OPTIONS}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value as FeeDiscountFormValues['type'])}
            />
          )}
        />
      </FormField>

      {discountType === 'percentage' ? (
        <FormNumberField
          control={control}
          name="percentage"
          label="Percentage"
          min={0.01}
          max={100}
          step={0.01}
          required
        />
      ) : (
        <FormNumberField
          control={control}
          name="amount"
          label="Amount"
          min={0.01}
          step={0.01}
          required
        />
      )}

      <FormTextareaField
        control={control}
        name="description"
        label="Description"
        rows={2}
        optional
      />
      <FormSwitchField control={control} name="is_active" label="Active" />
    </EntityFormDialog>
  );
}
