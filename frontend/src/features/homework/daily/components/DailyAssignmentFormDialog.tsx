import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormDateField, FormTextareaField, FormTextField } from '@components/forms/fields';
import { Input } from '@components/ui/input';
import {
  dailyAssignmentFormSchema,
  type DailyAssignmentFormValues,
} from '@features/homework/schemas/homework.schema';
import type { DailyAssignment } from '@app-types/academics/homework';
import { todayIsoDate } from '@utils/student';

interface DailyAssignmentFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: DailyAssignment | null;
  defaultEvaluatorId: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: DailyAssignmentFormValues) => void;
}

export function DailyAssignmentFormDialog({
  open,
  mode,
  initial,
  defaultEvaluatorId,
  isSubmitting,
  onClose,
  onSubmit,
}: DailyAssignmentFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DailyAssignmentFormValues>({
    resolver: zodResolver(dailyAssignmentFormSchema),
    defaultValues: {
      student_session_id: 0,
      subject_group_subject_id: 0,
      title: '',
      description: '',
      date: todayIsoDate(),
      remark: '',
      evaluated_by: defaultEvaluatorId || null,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      reset({
        student_session_id: initial.student_session_id,
        subject_group_subject_id: initial.subject_group_subject_id,
        title: initial.title ?? '',
        description: initial.description ?? '',
        date: initial.date ?? todayIsoDate(),
        remark: initial.remark ?? '',
        evaluated_by: initial.evaluated_by,
      });
      return;
    }
    reset({
      student_session_id: 0,
      subject_group_subject_id: 0,
      title: '',
      description: '',
      date: todayIsoDate(),
      remark: '',
      evaluated_by: defaultEvaluatorId || null,
    });
  }, [open, mode, initial, reset, defaultEvaluatorId]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={mode === 'create' ? 'Add daily assignment' : 'Edit daily assignment'}
      description="Daily assignments are linked to a student session and subject-group subject row."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isSubmitting}
      submitLabel={mode === 'create' ? 'Create' : 'Save'}
      size="lg"
    >
      <FormErrorSummary errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Student session ID"
          htmlFor="daily_student_session_id"
          error={errors.student_session_id?.message}
          required
          hint="ID from student_session for the active enrollment."
        >
          <Controller
            control={control}
            name="student_session_id"
            render={({ field }) => (
              <Input
                id="daily_student_session_id"
                type="number"
                value={field.value || ''}
                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
              />
            )}
          />
        </FormField>
        <FormField
          label="Subject group subject ID"
          htmlFor="daily_subject_group_subject_id"
          error={errors.subject_group_subject_id?.message}
          required
        >
          <Controller
            control={control}
            name="subject_group_subject_id"
            render={({ field }) => (
              <Input
                id="daily_subject_group_subject_id"
                type="number"
                value={field.value || ''}
                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
              />
            )}
          />
        </FormField>
        <FormTextField control={control} name="title" label="Title" optional />
        <FormDateField control={control} name="date" label="Date" optional />
        <div className="sm:col-span-2">
          <FormTextareaField
            control={control}
            name="description"
            label="Description"
            optional
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <FormTextareaField control={control} name="remark" label="Remark" required rows={3} />
        </div>
      </div>
    </EntityFormDialog>
  );
}
