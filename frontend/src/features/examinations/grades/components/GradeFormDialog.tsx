import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormNumberField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import type { Grade } from '@app-types/examinations/grade';
import {
  gradeFormSchema,
  type GradeFormValues,
} from '@features/examinations/grades/schemas/grade.schema';

interface GradeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade?: Grade | null;
  onSubmit: (values: GradeFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: GradeFormValues = {
  exam_type: 'General Pass',
  name: '',
  point: 0,
  mark_from: 0,
  mark_upto: 100,
  description: '',
  is_active: true,
};

export function GradeFormDialog({
  open,
  onOpenChange,
  grade,
  onSubmit,
  isLoading,
}: GradeFormDialogProps) {
  const isEdit = Boolean(grade);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && grade) {
      reset({
        exam_type: grade.exam_type ?? '',
        name: grade.name ?? '',
        point: grade.point ?? 0,
        mark_from: grade.mark_from ?? 0,
        mark_upto: grade.mark_upto ?? 100,
        description: grade.description ?? '',
        is_active: grade.is_active === 'yes',
      });
      return;
    }
    reset(defaultValues);
  }, [open, isEdit, grade, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit grade' : 'Add grade'}
      description="Define mark ranges and grade points for exam results."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitLabel={isEdit ? 'Save' : 'Create'}
    >
      <FormErrorSummary errors={errors} />
      <FormTextField control={control} name="exam_type" label="Exam type" />
      <FormTextField control={control} name="name" label="Grade name" />
      <FormNumberField control={control} name="point" label="Point" />
      <FormNumberField control={control} name="mark_from" label="Mark from" />
      <FormNumberField control={control} name="mark_upto" label="Mark upto" />
      <FormTextareaField control={control} name="description" label="Description" optional />
      <FormSwitchField control={control} name="is_active" label="Active" />
    </EntityFormDialog>
  );
}
