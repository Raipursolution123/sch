import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormSwitchField, FormTextField } from '@components/forms/fields';
import type { MarkDivision } from '@app-types/examinations/mark-division';
import {
  markDivisionFormSchema,
  type MarkDivisionFormValues,
} from '@features/examinations/divisions/schemas/mark-division.schema';

interface MarkDivisionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  division?: MarkDivision | null;
  onSubmit: (values: MarkDivisionFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: MarkDivisionFormValues = {
  name: '',
  percentage_from: 0,
  percentage_to: 100,
  is_active: true,
};

export function MarkDivisionFormDialog({
  open,
  onOpenChange,
  division,
  onSubmit,
  isLoading,
}: MarkDivisionFormDialogProps) {
  const isEdit = Boolean(division);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MarkDivisionFormValues>({
    resolver: zodResolver(markDivisionFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && division) {
      reset({
        name: division.name ?? '',
        percentage_from: division.percentage_from ?? 0,
        percentage_to: division.percentage_to ?? 100,
        is_active: division.is_active === 'yes',
      });
      return;
    }
    reset(defaultValues);
  }, [open, isEdit, division, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit division' : 'Add division'}
      description="Define percentage bands used for result division labels."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={isEdit ? 'Save' : 'Create'}
    >
      <FormErrorSummary errors={errors} />
      <FormTextField control={control} name="name" label="Division name" />
      <FormNumberField
        control={control}
        name="percentage_from"
        label="Percentage from"
        min={0}
        max={100}
      />
      <FormNumberField
        control={control}
        name="percentage_to"
        label="Percentage to"
        min={0}
        max={100}
      />
      <FormSwitchField control={control} name="is_active" label="Active" />
    </EntityFormDialog>
  );
}
