import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import type { PostalRecord } from '@app-types/front-office/postal';
import {
  postalFormSchema,
  type PostalFormValues,
} from '@features/front-office/postal/schemas/postal.schema';

interface PostalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: PostalRecord | null;
  onSubmit: (values: PostalFormValues) => void;
  isLoading?: boolean;
}

const today = new Date().toISOString().slice(0, 10);

const defaultValues: PostalFormValues = {
  reference_no: '',
  to_title: '',
  from_title: '',
  address: '',
  note: '',
  date: today,
};

export function PostalFormDialog({
  open,
  onOpenChange,
  record,
  onSubmit,
  isLoading,
}: PostalFormDialogProps) {
  const isEdit = Boolean(record);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostalFormValues>({
    resolver: zodResolver(postalFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && record) {
      reset({
        reference_no: record.reference_no,
        to_title: record.to_title,
        from_title: record.from_title ?? '',
        address: record.address ?? '',
        note: record.note ?? '',
        date: record.date ?? today,
      });
      return;
    }
    reset(defaultValues);
  }, [open, isEdit, record, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit postal record' : 'Add postal record'}
      description="Record postal dispatch or receive entries."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={isEdit ? 'Save' : 'Create'}
      size="lg"
      scrollable
    >
      <FormErrorSummary errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={control} name="reference_no" label="Reference no." />
        <FormTextField control={control} name="to_title" label="To" />
        <FormTextField control={control} name="from_title" label="From" optional />
        <FormTextField control={control} name="date" label="Date" type="date" optional />
      </div>
      <FormTextField control={control} name="address" label="Address" optional />
      <FormTextareaField control={control} name="note" label="Note" optional />
    </EntityFormDialog>
  );
}
