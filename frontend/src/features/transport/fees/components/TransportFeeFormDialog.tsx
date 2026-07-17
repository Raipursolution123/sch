import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSelectField, FormTextField } from '@components/forms/fields';
import type { TransportFeeMaster } from '@app-types/transport';
import {
  transportFeeFormSchema,
  type TransportFeeFormValues,
} from '@features/transport/fees/schemas/transport-fee.schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee?: TransportFeeMaster | null;
  sessions: { value: string; label: string }[];
  onSubmit: (values: TransportFeeFormValues) => void;
  isLoading?: boolean;
}

const defaults: TransportFeeFormValues = {
  session_id: '',
  month: '',
  due_date: '',
  fine_amount: '',
  fine_type: '',
  fine_percentage: '',
};

export function TransportFeeFormDialog({
  open,
  onOpenChange,
  fee,
  sessions,
  onSubmit,
  isLoading,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransportFeeFormValues>({
    resolver: zodResolver(transportFeeFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      fee
        ? {
            session_id: String(fee.session_id),
            month: fee.month ?? '',
            due_date: fee.due_date ?? '',
            fine_amount: fee.fine_amount == null ? '' : String(fee.fine_amount),
            fine_type: fee.fine_type ?? '',
            fine_percentage: fee.fine_percentage == null ? '' : String(fee.fine_percentage),
          }
        : defaults,
    );
  }, [open, fee, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={fee ? 'Edit transport fee' : 'Add transport fee'}
      description="Configure monthly transport fee deadlines and fines."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={fee ? 'Save changes' : 'Create'}
    >
      <FormErrorSummary errors={errors} />
      <FormSelectField
        control={control}
        name="session_id"
        label="Academic session"
        options={sessions}
        required
      />
      <FormTextField control={control} name="month" label="Month" placeholder="April" optional />
      <FormTextField control={control} name="due_date" label="Due date" type="date" optional />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField
          control={control}
          name="fine_amount"
          label="Fine amount"
          type="number"
          optional
        />
        <FormTextField control={control} name="fine_type" label="Fine type" optional />
      </div>
      <FormTextField
        control={control}
        name="fine_percentage"
        label="Fine percentage"
        type="number"
        optional
      />
    </EntityFormDialog>
  );
}
