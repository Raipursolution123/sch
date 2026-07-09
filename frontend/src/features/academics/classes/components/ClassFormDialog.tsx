import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormNumberField, FormSwitchField, FormTextField } from '@components/forms/fields';
import type { SchoolClass } from '@app-types/academics/class';
import {
  classFormSchema,
  type ClassFormValues,
} from '@features/academics/classes/schemas/class.schema';

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolClass?: SchoolClass | null;
  suggestedSortOrder?: number;
  onSubmit: (values: ClassFormValues) => void;
  isLoading?: boolean;
}

function toFormValues(schoolClass: SchoolClass): ClassFormValues {
  return {
    class_name: schoolClass.class_name,
    sort_order: schoolClass.sort_order,
    is_hedu_program: schoolClass.is_hedu_program,
    is_active: schoolClass.is_active === 'yes',
  };
}

export function ClassFormDialog({
  open,
  onOpenChange,
  schoolClass,
  suggestedSortOrder = 1,
  onSubmit,
  isLoading,
}: ClassFormDialogProps) {
  const isEdit = Boolean(schoolClass);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      class_name: '',
      sort_order: suggestedSortOrder,
      is_hedu_program: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        schoolClass
          ? toFormValues(schoolClass)
          : {
              class_name: '',
              sort_order: suggestedSortOrder,
              is_hedu_program: false,
              is_active: true,
            },
      );
    }
  }, [open, schoolClass, suggestedSortOrder, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit Class' : 'Add Class'}
      description={
        isEdit
          ? 'Update class details. Sort order controls display sequence across the system.'
          : 'Create a new class for student enrollment and academic structure.'
      }
      submitLabel={isEdit ? 'Save changes' : 'Create class'}
      onSubmit={handleSubmit(onSubmit)}
      size="sm"
    >
      <FormErrorSummary errors={errors} />
      <FormTextField control={control} name="class_name" label="Class name" placeholder="Class 5" required />
      <FormNumberField
        control={control}
        name="sort_order"
        label="Sort order"
        hint="Lower numbers appear first in lists and dropdowns."
        required
        min={0}
      />
      <FormSwitchField
        control={control}
        name="is_hedu_program"
        label="Higher education program"
        hint="Mark classes that belong to senior secondary / higher-ed streams."
      />
      <FormSwitchField
        control={control}
        name="is_active"
        label="Active"
        hint="Inactive classes are hidden from enrollment and assignment flows."
      />
    </EntityFormDialog>
  );
}
