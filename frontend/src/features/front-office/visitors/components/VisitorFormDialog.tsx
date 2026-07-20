import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormTextField, FormTextareaField, FormNumberField } from '@components/forms/fields';
import type { VisitorsBookEntry } from '@app-types/front-office/visitors-book';
import {
  visitorFormSchema,
  type VisitorFormValues,
} from '@features/front-office/visitors/schemas/visitor.schema';

interface VisitorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitor?: VisitorsBookEntry | null;
  onSubmit: (values: VisitorFormValues) => void;
  isLoading?: boolean;
}

const today = new Date().toISOString().slice(0, 10);

const defaultValues: VisitorFormValues = {
  name: '',
  contact: '',
  purpose: '',
  email: '',
  source: '',
  id_proof: '',
  no_of_people: 1,
  date: today,
  in_time: '',
  out_time: '',
  meeting_with: '',
  note: '',
};

export function VisitorFormDialog({
  open,
  onOpenChange,
  visitor,
  onSubmit,
  isLoading,
}: VisitorFormDialogProps) {
  const isEdit = Boolean(visitor);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && visitor) {
      reset({
        name: visitor.name,
        contact: visitor.contact,
        purpose: visitor.purpose,
        email: visitor.email ?? '',
        source: visitor.source ?? '',
        id_proof: visitor.id_proof ?? '',
        no_of_people: visitor.no_of_people,
        date: visitor.date,
        in_time: visitor.in_time ?? '',
        out_time: visitor.out_time ?? '',
        meeting_with: visitor.meeting_with ?? '',
        note: visitor.note ?? '',
      });
      return;
    }
    reset(defaultValues);
  }, [open, isEdit, visitor, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit visitor' : 'Add visitor'}
      description="Record visitor details for the front office visitor book."
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
        <FormTextField control={control} name="purpose" label="Purpose" />
        <FormTextField control={control} name="email" label="Email" optional />
        <FormTextField control={control} name="source" label="Source" optional />
        <FormTextField control={control} name="id_proof" label="ID proof" optional />
        <FormNumberField control={control} name="no_of_people" label="No. of people" optional />
        <FormTextField control={control} name="date" label="Visit date" type="date" />
        <FormTextField control={control} name="in_time" label="In time" optional />
        <FormTextField control={control} name="out_time" label="Out time" optional />
        <FormTextField control={control} name="meeting_with" label="Meeting with" optional />
      </div>
      <FormTextareaField control={control} name="note" label="Note" optional />
    </EntityFormDialog>
  );
}
