import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import {
  FormDateField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from '@components/forms/fields';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import type { ExamGroup } from '@app-types/examinations/exam-group';
import type { Exam } from '@app-types/examinations/exam';
import type { AcademicSession } from '@app-types/settings/session';
import {
  examFormSchema,
  type ExamFormValues,
} from '@features/examinations/exams/schemas/exam.schema';

interface ExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examGroups: ExamGroup[];
  sessions: AcademicSession[];
  exam?: Exam | null;
  onSubmit: (values: ExamFormValues) => void;
  isLoading?: boolean;
}

function toFormValues(exam: Exam): ExamFormValues {
  return {
    name: exam.name,
    exam_group_id: exam.exam_group_id,
    session_id: exam.session_id,
    date_from: exam.date_from ?? '',
    date_to: exam.date_to ?? '',
    passing_percentage: exam.passing_percentage,
    is_published: exam.is_published,
    description: exam.description ?? '',
    is_active: exam.is_active === 'yes',
  };
}

export function ExamFormDialog({
  open,
  onOpenChange,
  examGroups,
  sessions,
  exam,
  onSubmit,
  isLoading,
}: ExamFormDialogProps) {
  const isEdit = Boolean(exam);

  const activeGroups = useMemo(
    () =>
      examGroups.filter((g) => g.is_active === 'yes').sort((a, b) => a.name.localeCompare(b.name)),
    [examGroups],
  );
  const groupOptions = activeGroups.map((g) => ({ value: String(g.id), label: g.name }));
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: String(s.id), label: s.session })),
    [sessions],
  );

  const defaultSessionId = sessions.find((s) => s.is_active === 'yes')?.id ?? sessions[0]?.id ?? 0;
  const hasOptions = groupOptions.length > 0 && sessionOptions.length > 0;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      name: '',
      exam_group_id: activeGroups[0]?.id ?? 0,
      session_id: defaultSessionId,
      date_from: '',
      date_to: '',
      passing_percentage: null,
      is_published: false,
      description: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && exam) {
      reset(toFormValues(exam));
      return;
    }
    reset({
      name: '',
      exam_group_id: activeGroups[0]?.id ?? 0,
      session_id: defaultSessionId,
      date_from: '',
      date_to: '',
      passing_percentage: null,
      is_published: false,
      description: '',
      is_active: true,
    });
  }, [open, isEdit, exam, activeGroups, defaultSessionId, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit exam' : 'Add exam'}
      description="Define an examination window, passing criteria, and publication status."
      submitLabel={isEdit ? 'Save changes' : 'Add exam'}
      submitDisabled={!hasOptions}
      onSubmit={handleSubmit(onSubmit)}
      scrollable
    >
      <FormErrorSummary errors={errors} />

      {!hasOptions && (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Add active exam groups and academic sessions before creating exams.
        </p>
      )}

      <FormTextField
        control={control}
        name="name"
        label="Name"
        placeholder="Mid-Term 2025"
        required
        disabled={!hasOptions}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Exam group"
          htmlFor="exam_group_id"
          error={errors.exam_group_id?.message}
          required
        >
          <Controller
            name="exam_group_id"
            control={control}
            render={({ field }) => (
              <Select
                id="exam_group_id"
                placeholder="Select group"
                options={groupOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={!hasOptions}
              />
            )}
          />
        </FormField>
        <FormField label="Session" htmlFor="session_id" error={errors.session_id?.message} required>
          <Controller
            name="session_id"
            control={control}
            render={({ field }) => (
              <Select
                id="session_id"
                placeholder="Select session"
                options={sessionOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={!hasOptions}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormDateField
          control={control}
          name="date_from"
          label="Date from"
          optional
          disabled={!hasOptions}
        />
        <FormDateField
          control={control}
          name="date_to"
          label="Date to"
          optional
          disabled={!hasOptions}
        />
      </div>

      <FormField
        label="Passing percentage"
        htmlFor="passing_percentage"
        error={errors.passing_percentage?.message}
        optional
      >
        <Controller
          name="passing_percentage"
          control={control}
          render={({ field }) => (
            <Input
              id="passing_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="33"
              disabled={!hasOptions}
              value={field.value ?? ''}
              onChange={(event) => {
                const next = event.target.value;
                field.onChange(next === '' ? null : Number(next));
              }}
            />
          )}
        />
      </FormField>

      <FormSwitchField
        control={control}
        name="is_published"
        label="Published"
        onLabel="Published"
        offLabel="Draft"
        disabled={!hasOptions}
      />
      <FormTextareaField
        control={control}
        name="description"
        label="Description"
        rows={2}
        optional
        disabled={!hasOptions}
      />
      <FormSwitchField control={control} name="is_active" label="Active" disabled={!hasOptions} />
    </EntityFormDialog>
  );
}
