import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormDateField, FormTextareaField } from '@components/forms/fields';
import { Select } from '@components/ui/select';
import { Input } from '@components/ui/input';
import {
  homeworkFormSchema,
  type HomeworkFormValues,
} from '@features/homework/schemas/homework.schema';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import type { Homework } from '@app-types/academics/homework';
import type { ClassSection } from '@app-types/academics/class-section';
import { todayIsoDate } from '@utils/student';

interface HomeworkFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Homework | null;
  classOptions: { value: string; label: string }[];
  classSections: ClassSection[];
  subjectOptions: { value: string; label: string }[];
  staffOptions: { value: string; label: string }[];
  sessionId: number;
  defaultStaffId: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: HomeworkFormValues) => void;
}

export function HomeworkFormDialog({
  open,
  mode,
  initial,
  classOptions,
  classSections,
  subjectOptions,
  staffOptions,
  sessionId,
  defaultStaffId,
  isSubmitting,
  onClose,
  onSubmit,
}: HomeworkFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HomeworkFormValues>({
    resolver: zodResolver(homeworkFormSchema),
    defaultValues: {
      class_id: 0,
      section_id: 0,
      session_id: sessionId,
      staff_id: defaultStaffId,
      subject_id: null,
      homework_date: todayIsoDate(),
      submit_date: todayIsoDate(),
      marks: null,
      description: '',
    },
  });

  const classId = watch('class_id');

  const sectionOptions = useMemo(() => {
    if (!classId || classId <= 0) return [];
    return sectionOptionsForClass(classSections, classId);
  }, [classId, classSections]);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      reset({
        class_id: initial.class_id,
        section_id: initial.section_id,
        session_id: initial.session_id,
        staff_id: initial.staff_id,
        subject_id: initial.subject_id,
        homework_date: initial.homework_date,
        submit_date: initial.submit_date,
        marks: initial.marks,
        description: initial.description ?? '',
      });
      return;
    }
    reset({
      class_id: 0,
      section_id: 0,
      session_id: sessionId,
      staff_id: defaultStaffId || 0,
      subject_id: null,
      homework_date: todayIsoDate(),
      submit_date: todayIsoDate(),
      marks: null,
      description: '',
    });
  }, [open, mode, initial, reset, sessionId, defaultStaffId]);

  useEffect(() => {
    if (!open || mode === 'edit') return;
    if (classId > 0) {
      const nextSection = firstSectionIdForClass(classSections, classId) ?? 0;
      setValue('section_id', nextSection);
    }
  }, [classId, classSections, mode, open, setValue]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={mode === 'create' ? 'Assign homework' : 'Edit homework'}
      description="Create a homework assignment for a class section and subject."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isSubmitting}
      submitLabel={mode === 'create' ? 'Assign' : 'Save'}
      size="lg"
    >
      <FormErrorSummary errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Class"
          htmlFor="homework_class_id"
          error={errors.class_id?.message}
          required
        >
          <Controller
            control={control}
            name="class_id"
            render={({ field }) => (
              <Select
                id="homework_class_id"
                options={[{ value: '', label: 'Select class' }, ...classOptions]}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
              />
            )}
          />
        </FormField>
        <FormField
          label="Section"
          htmlFor="homework_section_id"
          error={errors.section_id?.message}
          required
        >
          <Controller
            control={control}
            name="section_id"
            render={({ field }) => (
              <Select
                id="homework_section_id"
                options={[{ value: '', label: 'Select section' }, ...sectionOptions]}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                disabled={!classId}
              />
            )}
          />
        </FormField>
        <FormField label="Subject" htmlFor="homework_subject_id" optional>
          <Controller
            control={control}
            name="subject_id"
            render={({ field }) => (
              <Select
                id="homework_subject_id"
                options={[{ value: '', label: 'Select subject' }, ...subjectOptions]}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => {
                  const next = Number(e.target.value) || 0;
                  field.onChange(next > 0 ? next : null);
                }}
              />
            )}
          />
        </FormField>
        <FormField
          label="Teacher"
          htmlFor="homework_staff_id"
          error={errors.staff_id?.message}
          required
        >
          <Controller
            control={control}
            name="staff_id"
            render={({ field }) => (
              <Select
                id="homework_staff_id"
                options={[{ value: '', label: 'Select teacher' }, ...staffOptions]}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
              />
            )}
          />
        </FormField>
        <FormDateField control={control} name="homework_date" label="Homework date" required />
        <FormDateField control={control} name="submit_date" label="Submit by" required />
        <FormField label="Marks" htmlFor="homework_marks" optional>
          <Controller
            control={control}
            name="marks"
            render={({ field }) => (
              <Input
                id="homework_marks"
                type="number"
                value={field.value ?? ''}
                onChange={(e) => {
                  const next = e.target.value;
                  field.onChange(next === '' ? null : Number(next));
                }}
              />
            )}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormTextareaField
            control={control}
            name="description"
            label="Description"
            optional
            rows={4}
          />
        </div>
      </div>
    </EntityFormDialog>
  );
}
