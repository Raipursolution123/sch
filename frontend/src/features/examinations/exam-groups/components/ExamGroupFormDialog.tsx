import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import {
  FormSelectField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import type { ExamGroup } from '@app-types/examinations/exam-group';
import { EXAM_TYPE_OPTIONS } from '@features/examinations/constants/options';
import {
  examGroupFormSchema,
  type ExamGroupFormValues,
} from '@features/examinations/exam-groups/schemas/exam-group.schema';

interface ExamGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examGroup?: ExamGroup | null;
  onSubmit: (values: ExamGroupFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: ExamGroupFormValues = {
  name: '',
  exam_type: EXAM_TYPE_OPTIONS[0].value,
  description: '',
  is_active: true,
};

function toFormValues(examGroup: ExamGroup): ExamGroupFormValues {
  return {
    name: examGroup.name,
    exam_type: examGroup.exam_type,
    description: examGroup.description ?? '',
    is_active: examGroup.is_active === 'yes',
  };
}

const examTypeSelectOptions = EXAM_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

export function ExamGroupFormDialog({
  open,
  onOpenChange,
  examGroup,
  onSubmit,
  isLoading,
}: ExamGroupFormDialogProps) {
  const isEdit = Boolean(examGroup);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamGroupFormValues>({
    resolver: zodResolver(examGroupFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(examGroup ? toFormValues(examGroup) : defaultValues);
  }, [open, examGroup, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit exam group' : 'Add exam group'}
      description="Organize exams by type such as term, unit test, or annual assessments."
      submitLabel={isEdit ? 'Save changes' : 'Add exam group'}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormErrorSummary errors={errors} />
      <FormTextField
        control={control}
        name="name"
        label="Name"
        placeholder="Mid-Term Exams"
        required
      />
      <FormSelectField
        control={control}
        name="exam_type"
        label="Exam type"
        options={examTypeSelectOptions}
        required
      />
      <FormTextareaField
        control={control}
        name="description"
        label="Description"
        rows={2}
        optional
      />
      <FormSwitchField control={control} name="is_active" label="Active" />
    </EntityFormDialog>
  );
}
