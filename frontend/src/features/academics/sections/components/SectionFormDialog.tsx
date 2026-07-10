import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormSwitchField, FormTextField } from '@components/forms/fields';
import type { Section } from '@app-types/academics/section';
import {
  sectionFormSchema,
  type SectionFormValues,
} from '@features/academics/sections/schemas/section.schema';

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: Section | null;
  onSubmit: (values: SectionFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: SectionFormValues = {
  section_name: '',
  is_active: true,
};

function toFormValues(section: Section): SectionFormValues {
  return {
    section_name: section.section_name,
    is_active: section.is_active === 'yes',
  };
}

export function SectionFormDialog({
  open,
  onOpenChange,
  section,
  onSubmit,
  isLoading,
}: SectionFormDialogProps) {
  const isEdit = Boolean(section);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(section ? toFormValues(section) : defaultValues);
    }
  }, [open, section, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit Section' : 'Add Section'}
      description={
        isEdit
          ? 'Update the section label used when grouping students within a class.'
          : 'Create a section such as A, B, or C for class divisions.'
      }
      submitLabel={isEdit ? 'Save changes' : 'Create section'}
      onSubmit={handleSubmit(onSubmit)}
      size="sm"
    >
      <FormErrorSummary errors={errors} />
      <FormTextField
        control={control}
        name="section_name"
        label="Section name"
        placeholder="A"
        hint="Typically a single letter or short label (e.g. A, B, Science)."
        required
      />
      <FormSwitchField
        control={control}
        name="is_active"
        label="Active"
        hint="Inactive sections are hidden from class-section assignment."
      />
    </EntityFormDialog>
  );
}
