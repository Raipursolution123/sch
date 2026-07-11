import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDialog } from '@components/forms/EntityFormDialog';
import { FormErrorSummary } from '@components/forms/FormErrorSummary';
import { FormField } from '@components/forms/FormField';
import { FormSelectField } from '@components/forms/fields';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import type {
  TimetableDay,
  TimetablePeriod,
  TimetableSubjectOption,
} from '@app-types/academics/timetable';
import type { StaffListItem } from '@app-types/staff/staff';
import {
  timetablePeriodSchema,
  type TimetablePeriodFormValues,
} from '@features/academics/timetable/schemas/timetable.schema';
import { TIMETABLE_DAYS } from '@app-types/academics/timetable';

interface TimetablePeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period?: TimetablePeriod | null;
  defaultDay?: TimetableDay;
  subjectOptions: TimetableSubjectOption[];
  staff: StaffListItem[];
  onSubmit: (values: TimetablePeriodFormValues) => void;
  isLoading?: boolean;
}

const dayOptions = TIMETABLE_DAYS.map((day) => ({ value: day, label: day }));

function toFormValues(period: TimetablePeriod): TimetablePeriodFormValues {
  return {
    subject_group_subject_id: period.subject_group_subject_id ?? 0,
    staff_id: period.staff_id ?? 0,
    day: (period.day as TimetableDay) ?? 'Monday',
    start_time: period.start_time?.slice(0, 5) ?? '',
    end_time: period.end_time?.slice(0, 5) ?? '',
    room_no: period.room_no ?? '',
  };
}

export function TimetablePeriodDialog({
  open,
  onOpenChange,
  period,
  defaultDay = 'Monday',
  subjectOptions,
  staff,
  onSubmit,
  isLoading,
}: TimetablePeriodDialogProps) {
  const isEdit = Boolean(period);

  const staffOptions = useMemo(
    () =>
      staff
        .filter((s) => s.is_active === 'yes')
        .map((s) => ({ value: String(s.id), label: s.full_name || `${s.name} ${s.surname}` })),
    [staff],
  );

  const subjectSelectOptions = useMemo(
    () =>
      subjectOptions.map((opt) => ({
        value: String(opt.subject_group_subject_id),
        label: `${opt.subject_name} (${opt.subject_code})`,
      })),
    [subjectOptions],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TimetablePeriodFormValues>({
    resolver: zodResolver(timetablePeriodSchema),
    defaultValues: {
      subject_group_subject_id: 0,
      staff_id: 0,
      day: defaultDay,
      start_time: '',
      end_time: '',
      room_no: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (period) {
      reset(toFormValues(period));
      return;
    }
    reset({
      subject_group_subject_id: subjectOptions[0]?.subject_group_subject_id ?? 0,
      staff_id: staffOptions.length > 0 ? Number(staffOptions[0].value) : 0,
      day: defaultDay,
      start_time: '',
      end_time: '',
      room_no: '',
    });
  }, [open, period, defaultDay, subjectOptions, staffOptions, reset]);

  const canSubmit = subjectSelectOptions.length > 0 && staffOptions.length > 0;

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      isEdit={isEdit}
      isLoading={isLoading}
      title={isEdit ? 'Edit Period' : 'Add Period'}
      description="Assign a subject, teacher, and time slot for this class section."
      submitLabel={isEdit ? 'Save changes' : 'Add period'}
      submitDisabled={!canSubmit}
      onSubmit={handleSubmit(onSubmit)}
      size="md"
    >
      <FormErrorSummary errors={errors} />

      {!canSubmit ? (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Configure subject groups for this class-section and ensure active staff exist before
          scheduling periods.
        </p>
      ) : null}

      <FormSelectField control={control} name="day" label="Day" options={dayOptions} required />

      <FormField
        label="Subject"
        htmlFor="subject_group_subject_id"
        error={errors.subject_group_subject_id?.message}
        required
      >
        <Controller
          name="subject_group_subject_id"
          control={control}
          render={({ field }) => (
            <Select
              id="subject_group_subject_id"
              options={subjectSelectOptions}
              placeholder="Select subject"
              disabled={!canSubmit}
              value={field.value ? String(field.value) : ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
              aria-invalid={Boolean(errors.subject_group_subject_id)}
            />
          )}
        />
      </FormField>

      <FormField label="Teacher" htmlFor="staff_id" error={errors.staff_id?.message} required>
        <Controller
          name="staff_id"
          control={control}
          render={({ field }) => (
            <Select
              id="staff_id"
              options={staffOptions}
              placeholder="Select teacher"
              disabled={!canSubmit}
              value={field.value ? String(field.value) : ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
              aria-invalid={Boolean(errors.staff_id)}
            />
          )}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start" htmlFor="start_time" error={errors.start_time?.message} required>
          <Controller
            name="start_time"
            control={control}
            render={({ field }) => (
              <Input id="start_time" type="time" {...field} disabled={!canSubmit} />
            )}
          />
        </FormField>
        <FormField label="End" htmlFor="end_time" error={errors.end_time?.message} required>
          <Controller
            name="end_time"
            control={control}
            render={({ field }) => (
              <Input id="end_time" type="time" {...field} disabled={!canSubmit} />
            )}
          />
        </FormField>
      </div>

      <FormField label="Room" htmlFor="room_no" error={errors.room_no?.message} optional>
        <Controller
          name="room_no"
          control={control}
          render={({ field }) => (
            <Input id="room_no" placeholder="101" {...field} disabled={!canSubmit} />
          )}
        />
      </FormField>
    </EntityFormDialog>
  );
}
