import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormSwitchField } from '@components/forms/fields';
import type { FeeReminder } from '@app-types/fees/fee-reminder';
import {
  feeReminderFormSchema,
  type FeeReminderFormValues,
} from '@features/fees/reminders/schemas/fee-reminder.schema';

interface FeeReminderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: FeeReminder | null;
  onSubmit: (values: FeeReminderFormValues) => void;
  isLoading?: boolean;
}

export function FeeReminderFormDialog({
  open,
  onOpenChange,
  reminder,
  onSubmit,
  isLoading,
}: FeeReminderFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeeReminderFormValues>({
    resolver: zodResolver(feeReminderFormSchema),
    defaultValues: { day: 0, is_active: false },
  });

  useEffect(() => {
    if (!open || !reminder) return;
    reset({
      day: reminder.day ?? 0,
      is_active: reminder.is_active === 'yes',
    });
  }, [open, reminder, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit fee reminder"
      description={
        reminder?.reminder_type
          ? `Configure days and status for "${reminder.reminder_type}" reminders.`
          : 'Configure reminder days and status.'
      }
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel="Save"
    >
      <FormErrorSummary errors={errors} />
      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
        <span className="text-muted-foreground">Type: </span>
        <span className="font-medium capitalize">{reminder?.reminder_type ?? '—'}</span>
      </div>
      <FormNumberField control={control} name="day" label="Days" min={0} />
      <FormSwitchField control={control} name="is_active" label="Active" />
    </EntityFormDialog>
  );
}
