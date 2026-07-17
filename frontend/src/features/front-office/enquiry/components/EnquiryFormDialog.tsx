import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import type { Enquiry } from '@app-types/front-office/enquiry';
import {
  enquiryFormSchema,
  type EnquiryFormValues,
} from '@features/front-office/enquiry/schemas/enquiry.schema';

interface EnquiryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiry?: Enquiry | null;
  onSubmit: (values: EnquiryFormValues) => void;
  isLoading?: boolean;
}

const today = new Date().toISOString().slice(0, 10);

const defaultValues: EnquiryFormValues = {
  name: '',
  contact: '',
  email: '',
  source: '',
  status: 'active',
  date: today,
  follow_up_date: today,
  description: '',
  note: '',
};

export function EnquiryFormDialog({
  open,
  onOpenChange,
  enquiry,
  onSubmit,
  isLoading,
}: EnquiryFormDialogProps) {
  const isEdit = Boolean(enquiry);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && enquiry) {
      reset({
        name: enquiry.name,
        contact: enquiry.contact,
        email: enquiry.email ?? '',
        source: enquiry.source ?? '',
        status: enquiry.status,
        date: enquiry.date,
        follow_up_date: enquiry.follow_up_date,
        description: enquiry.description ?? '',
        note: enquiry.note ?? '',
      });
      return;
    }
    reset(defaultValues);
  }, [open, isEdit, enquiry, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit enquiry' : 'Add enquiry'}
      description="Capture admission enquiries from walk-ins, calls, and referrals."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={isEdit ? 'Save' : 'Create'}
      size="lg"
      scrollable
    >
      <FormErrorSummary errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={control} name="name" label="Name" />
        <FormTextField control={control} name="contact" label="Contact" />
        <FormTextField control={control} name="email" label="Email" optional />
        <FormTextField control={control} name="source" label="Source" optional />
        <FormTextField control={control} name="status" label="Status" />
        <FormTextField control={control} name="date" label="Enquiry date" type="date" />
        <FormTextField control={control} name="follow_up_date" label="Follow-up date" type="date" />
      </div>
      <FormTextareaField control={control} name="description" label="Description" optional />
      <FormTextareaField control={control} name="note" label="Note" optional />
    </EntityFormDialog>
  );
}
