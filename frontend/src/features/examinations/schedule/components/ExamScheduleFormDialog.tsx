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
  FormTimeField,
} from '@components/forms/fields';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import type { Exam } from '@app-types/examinations/exam';
import type { ExamSchedule } from '@app-types/examinations/exam-schedule';
import type { Subject } from '@app-types/academics/subject';
import type { AcademicSession } from '@app-types/settings/session';
import {
  examScheduleFormSchema,
  type ExamScheduleFormValues,
} from '@features/examinations/schedule/schemas/exam-schedule.schema';

interface ExamScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exams: Exam[];
  subjects: Subject[];
  sessions: AcademicSession[];
  schedule?: ExamSchedule | null;
  onSubmit: (values: ExamScheduleFormValues) => void;
  isLoading?: boolean;
}

function toNullableNumber(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function toFormValues(schedule: ExamSchedule): ExamScheduleFormValues {
  return {
    exam_id: schedule.exam_id,
    subject_id: schedule.subject_id,
    session_id: schedule.session_id,
    date_of_exam: schedule.date_of_exam ?? '',
    start_time: schedule.start_time ?? '',
    end_time: schedule.end_time ?? '',
    room_no: schedule.room_no ?? '',
    full_marks: schedule.full_marks,
    passing_marks: schedule.passing_marks,
    note: schedule.note ?? '',
    is_active: schedule.is_active === 'yes',
  };
}

export function ExamScheduleFormDialog({
  open,
  onOpenChange,
  exams,
  subjects,
  sessions,
  schedule,
  onSubmit,
  isLoading,
}: ExamScheduleFormDialogProps) {
  const isEdit = Boolean(schedule);

  const activeExams = useMemo(
    () => exams.filter((e) => e.is_active === 'yes').sort((a, b) => a.name.localeCompare(b.name)),
    [exams],
  );
  const activeSubjects = useMemo(
    () =>
      subjects.filter((s) => s.is_active === 'yes').sort((a, b) => a.name.localeCompare(b.name)),
    [subjects],
  );

  const examOptions = activeExams.map((e) => ({ value: String(e.id), label: e.name }));
  const subjectOptions = activeSubjects.map((s) => ({
    value: String(s.id),
    label: `${s.code} — ${s.name}`,
  }));
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: String(s.id), label: s.session })),
    [sessions],
  );

  const defaultSessionId = sessions.find((s) => s.is_active === 'yes')?.id ?? sessions[0]?.id ?? 0;
  const hasOptions =
    examOptions.length > 0 && subjectOptions.length > 0 && sessionOptions.length > 0;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamScheduleFormValues>({
    resolver: zodResolver(examScheduleFormSchema),
    defaultValues: {
      exam_id: activeExams[0]?.id ?? 0,
      subject_id: activeSubjects[0]?.id ?? 0,
      session_id: defaultSessionId,
      date_of_exam: '',
      start_time: '',
      end_time: '',
      room_no: '',
      full_marks: null,
      passing_marks: null,
      note: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && schedule) {
      reset(toFormValues(schedule));
      return;
    }
    reset({
      exam_id: activeExams[0]?.id ?? 0,
      subject_id: activeSubjects[0]?.id ?? 0,
      session_id: defaultSessionId,
      date_of_exam: '',
      start_time: '',
      end_time: '',
      room_no: '',
      full_marks: null,
      passing_marks: null,
      note: '',
      is_active: true,
    });
  }, [open, isEdit, schedule, activeExams, activeSubjects, defaultSessionId, reset]);

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit exam schedule' : 'Add exam schedule'}
      description="Schedule a subject paper with date, time, room, and marking details."
      submitLabel={isEdit ? 'Save changes' : 'Add schedule'}
      submitDisabled={!hasOptions}
      onSubmit={handleSubmit(onSubmit)}
      size="lg"
      scrollable
    >
      <FormErrorSummary errors={errors} />

      {!hasOptions && (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Add active exams, subjects, and sessions before scheduling papers.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Exam" htmlFor="exam_id" error={errors.exam_id?.message} required>
          <Controller
            name="exam_id"
            control={control}
            render={({ field }) => (
              <Select
                id="exam_id"
                placeholder="Select exam"
                options={examOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={!hasOptions}
              />
            )}
          />
        </FormField>
        <FormField label="Subject" htmlFor="subject_id" error={errors.subject_id?.message} required>
          <Controller
            name="subject_id"
            control={control}
            render={({ field }) => (
              <Select
                id="subject_id"
                placeholder="Select subject"
                options={subjectOptions}
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

      <div className="grid gap-4 sm:grid-cols-3">
        <FormDateField
          control={control}
          name="date_of_exam"
          label="Date of exam"
          optional
          disabled={!hasOptions}
        />
        <FormTimeField
          control={control}
          name="start_time"
          label="Start time"
          optional
          disabled={!hasOptions}
        />
        <FormTimeField
          control={control}
          name="end_time"
          label="End time"
          optional
          disabled={!hasOptions}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormTextField
          control={control}
          name="room_no"
          label="Room no."
          placeholder="101"
          optional
          disabled={!hasOptions}
        />
        <FormField
          label="Full marks"
          htmlFor="full_marks"
          error={errors.full_marks?.message}
          optional
        >
          <Controller
            name="full_marks"
            control={control}
            render={({ field }) => (
              <Input
                id="full_marks"
                type="number"
                min="1"
                step="1"
                disabled={!hasOptions}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(toNullableNumber(event.target.value))}
              />
            )}
          />
        </FormField>
        <FormField
          label="Passing marks"
          htmlFor="passing_marks"
          error={errors.passing_marks?.message}
          optional
        >
          <Controller
            name="passing_marks"
            control={control}
            render={({ field }) => (
              <Input
                id="passing_marks"
                type="number"
                min="0"
                step="1"
                disabled={!hasOptions}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(toNullableNumber(event.target.value))}
              />
            )}
          />
        </FormField>
      </div>

      <FormTextareaField
        control={control}
        name="note"
        label="Note"
        rows={2}
        optional
        disabled={!hasOptions}
      />
      <FormSwitchField control={control} name="is_active" label="Active" disabled={!hasOptions} />
    </EntityFormDialog>
  );
}
