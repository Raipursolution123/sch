import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSection } from '@components/forms/FormSection';
import { FormTextField } from '@components/forms/fields';
import {
  guardianFormSchema,
  type GuardianFormValues,
} from '@features/students/schemas/guardian.schema';

interface GuardianFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: GuardianFormValues;
  onSubmit: (values: GuardianFormValues) => void;
  isLoading?: boolean;
}

const emptyValues: GuardianFormValues = {
  father_name: '',
  mother_name: '',
  guardian_name: '',
  guardian_phone: '',
};

export function GuardianFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isLoading,
}: GuardianFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [open, defaultValues, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit
      isLoading={isLoading}
      title="Edit Parents Details"
      description="Update parent and guardian contact information for this student."
      submitLabel="Save changes"
      onSubmit={handleSubmit(onSubmit)}
      size="sm"
    >
      <FormErrorSummary errors={errors} />

      <FormSection title="Parents Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField control={control} name="father_name" label="Father's name" optional />
          <FormTextField control={control} name="mother_name" label="Mother's name" optional />
        </div>
      </FormSection>

      <FormSection title="Guardian">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField control={control} name="guardian_name" label="Guardian's name" optional />
          <FormTextField
            control={control}
            name="guardian_phone"
            label="Guardian phone"
            type="tel"
            autoComplete="tel"
            optional
          />
        </div>
      </FormSection>
    </EntityFormDialog>
  );
}
