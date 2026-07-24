import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField } from '@components/forms/fields';
import type { Complaint } from '@app-types/front-office/complaint';
import {
  complaintFormSchema,
  type ComplaintFormValues,
} from '@features/front-office/complaints/schemas/complaint.schema';

interface ComplaintFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint?: Complaint | null;
  onSubmit: (values: ComplaintFormValues) => void;
  isLoading?: boolean;
}

const today = new Date().toISOString().slice(0, 10);

const defaultValues: ComplaintFormValues = {
  name: '',
  complaint_type: '',
  source: '',
  contact: '',
  email: '',
  date: today,
  description: '',
  action_taken: '',
  assigned: '',
  note: '',
};

export function ComplaintFormDialog({
  open,
  onOpenChange,
  complaint,
  onSubmit,
  isLoading,
}: ComplaintFormDialogProps) {
  const isEdit = Boolean(complaint);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && complaint) {
      reset({
        name: complaint.name,
        complaint_type: complaint.complaint_type ?? '',
        source: complaint.source ?? '',
        contact: complaint.contact ?? '',
        email: complaint.email ?? '',
        date: complaint.date,
        description: complaint.description ?? '',
        action_taken: complaint.action_taken ?? '',
        assigned: complaint.assigned ?? '',
        note: complaint.note ?? '',
      });
      return;
    }
    reset(defaultValues);
  }, [open, isEdit, complaint, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit complaint' : 'Add complaint'}
      description="Record and track complaints received at the front office."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={isEdit ? 'Save' : 'Create'}
      size="lg"
      scrollable
    >
      <FormErrorSummary errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={control} name="name" label="Complainant name" />
        <FormTextField control={control} name="complaint_type" label="Type" optional />
        <FormTextField control={control} name="source" label="Source" optional />
        <FormTextField control={control} name="contact" label="Contact" optional />
        <FormTextField control={control} name="email" label="Email" optional />
        <FormTextField control={control} name="date" label="Date" type="date" />
        <FormTextField control={control} name="assigned" label="Assigned to" optional />
      </div>
      <FormTextareaField control={control} name="description" label="Description" optional />
      <FormTextareaField control={control} name="action_taken" label="Action taken" optional />
      <FormTextareaField control={control} name="note" label="Note" optional />
    </EntityFormDialog>
  );
}
